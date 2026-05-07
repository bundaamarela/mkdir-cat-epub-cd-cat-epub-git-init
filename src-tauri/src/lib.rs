use std::path::Path;
use std::sync::{Mutex, OnceLock};
use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct EpubFile {
    pub path: String,
    pub name: String,
}

/// Recursively walks `dir` and collects all .epub files.
fn collect_epubs(dir: &Path) -> Vec<EpubFile> {
    let mut result = Vec::new();
    let Ok(entries) = std::fs::read_dir(dir) else {
        return result;
    };
    for entry in entries.flatten() {
        let p = entry.path();
        if p.is_dir() {
            result.extend(collect_epubs(&p));
        } else if p.extension()
            .and_then(|e| e.to_str())
            .is_some_and(|e| e.eq_ignore_ascii_case("epub"))
        {
            let name = p
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_default();
            result.push(EpubFile {
                path: p.to_string_lossy().into_owned(),
                name,
            });
        }
    }
    result
}

#[tauri::command]
fn scan_library_folder(path: String) -> Vec<EpubFile> {
    collect_epubs(Path::new(&path))
}

// Global watcher kept alive for the lifetime of the app.
static WATCHER: OnceLock<Mutex<Option<RecommendedWatcher>>> = OnceLock::new();

#[tauri::command]
fn watch_library_folder(path: String, app: AppHandle) -> Result<(), String> {
    let slot = WATCHER.get_or_init(|| Mutex::new(None));
    let mut guard = slot.lock().map_err(|e| e.to_string())?;

    // Stop any existing watcher before starting a new one.
    *guard = None;

    let app_clone = app.clone();
    let mut watcher = notify::recommended_watcher(move |res: notify::Result<Event>| {
        let Ok(event) = res else { return };
        match event.kind {
            EventKind::Create(_) | EventKind::Modify(_) => {
                for p in &event.paths {
                    if p.extension()
                        .and_then(|e| e.to_str())
                        .is_some_and(|e| e.eq_ignore_ascii_case("epub"))
                    {
                        let file = EpubFile {
                            path: p.to_string_lossy().into_owned(),
                            name: p
                                .file_name()
                                .map(|n| n.to_string_lossy().into_owned())
                                .unwrap_or_default(),
                        };
                        let _ = app_clone.emit("library-folder-changed", file);
                    }
                }
            }
            _ => {}
        }
    })
    .map_err(|e| e.to_string())?;

    watcher
        .watch(Path::new(&path), RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    *guard = Some(watcher);
    Ok(())
}

#[tauri::command]
async fn pick_folder(app: AppHandle) -> Option<String> {
    use tauri_plugin_dialog::DialogExt;
    app.dialog()
        .file()
        .set_title("Escolher pasta de livros")
        .blocking_pick_folder()
        .map(|f| f.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_library_folder,
            watch_library_folder,
            pick_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
