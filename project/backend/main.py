from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import os
import uuid
import librosa
import numpy as np
import math
import json
import logging
from pathlib import Path
from scipy.ndimage import gaussian_filter1d

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = "downloads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CHORD_CHARTS = {
    'A':   {'chord': 'A',   'frets': [0, 0, 2, 2, 2, 0], 'fingers': [0, 0, 1, 2, 3, 0]},
    'A#':  {'chord': 'A#',  'frets': [1, 1, 3, 3, 3, 1], 'fingers': [1, 1, 2, 3, 4, 1]},
    'A#m': {'chord': 'A#m', 'frets': [1, 1, 3, 3, 2, 1], 'fingers': [1, 1, 3, 4, 2, 1]},
    'Am':  {'chord': 'Am',  'frets': [0, 0, 2, 2, 1, 0], 'fingers': [0, 0, 2, 3, 1, 0]},
    'B':   {'chord': 'B',   'frets': [2, 2, 4, 4, 4, 2], 'fingers': [1, 1, 2, 3, 4, 1]},
    'Bb':  {'chord': 'Bb',  'frets': [1, 1, 3, 3, 3, 1], 'fingers': [1, 1, 2, 3, 4, 1]},
    'Bm':  {'chord': 'Bm',  'frets': [2, 2, 4, 4, 3, 2], 'fingers': [1, 1, 3, 4, 2, 1]},
    'C':   {'chord': 'C',   'frets': [0, 3, 2, 0, 1, 0], 'fingers': [0, 3, 2, 0, 1, 0]},
    'C#':  {'chord': 'C#',  'frets': [-1, 4, 6, 6, 6, 4], 'fingers': [0, 1, 3, 4, 2, 1]},
    'C#m': {'chord': 'C#m', 'frets': [4, 4, 6, 6, 5, 4], 'fingers': [1, 1, 3, 4, 2, 1]},
    'Cm':  {'chord': 'Cm',  'frets': [-1, 3, 5, 5, 4, 3], 'fingers': [0, 1, 3, 4, 2, 1]},
    'D':   {'chord': 'D',   'frets': [-1, 0, 0, 2, 3, 2], 'fingers': [0, 0, 0, 1, 3, 2]},
    'D#':  {'chord': 'D#',  'frets': [-1, 6, 8, 8, 8, 6], 'fingers': [0, 1, 3, 4, 2, 1]},
    'D#m': {'chord': 'D#m', 'frets': [-1, 6, 8, 8, 7, 6], 'fingers': [0, 1, 3, 4, 2, 1]},
    'Dm':  {'chord': 'Dm',  'frets': [-1, 0, 0, 2, 3, 1], 'fingers': [0, 0, 0, 2, 3, 1]},
    'E':   {'chord': 'E',   'frets': [0, 2, 2, 1, 0, 0], 'fingers': [0, 2, 3, 1, 0, 0]},
    'Em':  {'chord': 'Em',  'frets': [0, 2, 2, 0, 0, 0], 'fingers': [0, 1, 2, 0, 0, 0]},
    'F':   {'chord': 'F',   'frets': [1, 3, 3, 2, 1, 1], 'fingers': [1, 3, 4, 2, 1, 1]},
    'F#':  {'chord': 'F#',  'frets': [2, 4, 4, 3, 2, 2], 'fingers': [1, 3, 4, 2, 1, 1]},
    'Fm':  {'chord': 'Fm',  'frets': [1, 3, 3, 1, 1, 1], 'fingers': [1, 3, 4, 1, 1, 1]},
    'F#m': {'chord': 'F#m', 'frets': [2, 4, 4, 2, 2, 2], 'fingers': [1, 3, 4, 1, 1, 1]},
    'G':   {'chord': 'G',   'frets': [3, 2, 0, 0, 3, 3], 'fingers': [3, 1, 0, 0, 4, 4]},
    'G#':  {'chord': 'G#',  'frets': [4, 6, 6, 5, 4, 4], 'fingers': [1, 3, 4, 2, 1, 1]},
    'G#m': {'chord': 'G#m', 'frets': [4, 6, 6, 4, 4, 4], 'fingers': [1, 3, 4, 1, 1, 1]},
    'Gm':  {'chord': 'Gm',  'frets': [3, 3, 5, 5, 3, 3], 'fingers': [1, 1, 3, 4, 1, 1]},
}

KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
MAJOR = np.array([0, 4, 7])
MINOR = np.array([0, 3, 7])

def build_chord_templates():
    names, mats = [], []
    for i, root in enumerate(KEYS):
        vecM = np.zeros(12)
        vecM[(i + MAJOR) % 12] = 1
        vecm = np.zeros(12)
        vecm[(i + MINOR) % 12] = 1
        mats.append(vecM / vecM.sum())
        names.append(root)
        mats.append(vecm / vecm.sum())
        names.append(root + "m")
    return names, np.array(mats, dtype=float)

def viterbi_decode(score_matrix, switch_penalty=0.2):
    T, N = score_matrix.shape
    dp = np.zeros((T, N))
    back = np.zeros((T, N), dtype=int)
    dp[0] = score_matrix[0]
    for t in range(1, T):
        trans = dp[t-1][:, None] - switch_penalty
        stay_or_switch = np.maximum(trans.max(axis=0), dp[t-1])
        best_prev = np.argmax(trans, axis=0)
        dp[t] = score_matrix[t] + stay_or_switch
        back[t] = np.where(dp[t-1] >= trans.max(axis=0), np.arange(N), best_prev)
    path = np.zeros(T, dtype=int)
    path[-1] = np.argmax(dp[-1])
    for t in range(T-2, -1, -1):
        path[t] = back[t+1, path[t+1]]
    return path

def merge_segments(idx_path, chord_names, times, min_dur=0.5):
    segs = []
    start = 0
    cur = idx_path[0]
    for i in range(1, min(len(idx_path), len(times))):
        if idx_path[i] != cur:
            dur = float(times[i] - times[start])
            if dur >= min_dur:
                segs.append({"chord": chord_names[cur], "timestamp": float(times[start]), "duration": dur})
            start = i
            cur = idx_path[i]
    if start < len(times):
        dur = float(times[-1] - times[start])
        if dur >= min_dur:
            segs.append({"chord": chord_names[cur], "timestamp": float(times[start]), "duration": dur})
    return segs

def estimate_key_from_chords(chords):
    roots = [c.replace("m", "") for c in chords]
    return max(set(roots), key=roots.count) if roots else "C"

def download_audio_from_youtube(video_url, out_dir):
    tmp_id = uuid.uuid4().hex
    out_tmpl = os.path.join(out_dir, f"{tmp_id}.%(ext)s")
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": out_tmpl,
        "noplaylist": True,
        "quiet": True,
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}],
        "extractor_args": {"youtube": {"player_client": ["android"]}},
        "http_headers": {"User-Agent": "Mozilla/5.0"},
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)
        final_path = str(Path(ydl.prepare_filename(info)).with_suffix(".mp3"))
    if not os.path.exists(final_path):
        raise ValueError("Download failed")
    return final_path

def analyze_audio_for_chords(audio_path):
    y, sr = librosa.load(audio_path, mono=True, duration=60)
    y = y / (np.sqrt(np.mean(y**2)) + 1e-6)
    y_h, _ = librosa.effects.hpss(y)
    tempo_raw, beat_frames = librosa.beat.beat_track(y=y_h, sr=sr)
    tempo = float(tempo_raw)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    chroma = librosa.feature.chroma_cens(y=y_h, sr=sr, hop_length=512)
    chroma_sync = librosa.util.sync(chroma, beat_frames, aggregate=np.median).T
    chord_names, templates = build_chord_templates()
    norm_chroma = chroma_sync / (np.linalg.norm(chroma_sync, axis=1, keepdims=True) + 1e-9)
    norm_temp = templates / (np.linalg.norm(templates, axis=1, keepdims=True) + 1e-9)
    sims = gaussian_filter1d(norm_chroma @ norm_temp.T, sigma=1.0, axis=0)
    path = viterbi_decode(sims, switch_penalty=0.15)
    segments = merge_segments(path, chord_names, beat_times, min_dur=0.5)
    est_key = estimate_key_from_chords([s["chord"] for s in segments])
    unique = list(dict.fromkeys([s["chord"] for s in segments]))
    chord_charts = [CHORD_CHARTS.get(c, CHORD_CHARTS["C"]) for c in unique if c in CHORD_CHARTS]
    return {
        "bpm": int(round(tempo)),
        "signature": "4/4",
        "key": f"{est_key} Major",
        "chords": segments,
        "chordCharts": chord_charts
    }

@app.route("/download", methods=["POST"])
def download_audio():
    data = request.get_json()
    video_url = data.get("url")
    if not video_url:
        return jsonify({"error": "URL is required"}), 400
    try:
        path = download_audio_from_youtube(video_url, OUTPUT_DIR)
        return jsonify({"file": path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze_song():
    data = request.get_json(silent=True) or {}
    video_id = data.get("videoId")
    video_url = data.get("url") or f"https://www.youtube.com/watch?v={video_id}" if video_id else None
    if not video_url:
        return jsonify({"error": "videoId or url is required"}), 400
    try:
        audio_path = download_audio_from_youtube(video_url, OUTPUT_DIR)
        result = analyze_audio_for_chords(audio_path)
        return jsonify(result)
    except Exception as e:
        app.logger.exception("Analyze failed")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
