import os
import yt_dlp
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)

# Set FFmpeg Path (Update this with your actual path)
FFMPEG_PATH = r"C:\ffmpeg\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe"
os.environ["FFMPEG_BINARY"] = FFMPEG_PATH

# Check if FFmpeg is working
try:
    subprocess.run([FFMPEG_PATH, "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    print("✅ FFmpeg is correctly configured!")
except FileNotFoundError:
    print("❌ Error: FFmpeg not found. Check the path.")
    exit(1)

# Progress tracking
progress_status = {}


def progress_hook(d):
    if d['status'] == 'downloading':
        progress_status[d['filename']] = d['_percent_str']
        print(f"📥 Downloading {d['filename']}: {d['_percent_str']}")
    elif d['status'] == 'finished':
        print(f"✅ Download finished: {d['filename']} ({d['total_bytes']} bytes)")
        progress_status[d['filename']] = "Completed"


def get_media_details(media_url):
    ydl_opts = {
        'quiet': True,
        'noplaylist': True,
        'skip_download': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(media_url, download=False)
            return {
                'title': info.get('title', 'N/A'),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'size_MB': round(info.get('filesize_approx', 0) / (1024 * 1024), 2) if info.get('filesize_approx') else 'Unknown',
                'description': info.get('description', 'No description available'),
            }
        except Exception as e:
            return {'error': str(e)}


@app.route('/details', methods=['POST'])
def media_details():
    data = request.get_json()
    media_url = data.get('video_link')

    if not media_url:
        return jsonify({"error": "No media URL provided"}), 400

    details = get_media_details(media_url)
    return jsonify(details)


def download_video(url):
    download_folder = os.path.join(os.path.expanduser('~'), 'Downloads')

    ydl_opts = {
        'format': 'best',
        'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'progress_hooks': [progress_hook],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"📥 Starting video download from {url}...")
            ydl.download([url])
            print("✅ Video download completed!")
    except Exception as e:
        print(f"❌ Error downloading video: {e}")


def download_audio(url):
    download_folder = os.path.join(os.path.expanduser('~'), 'Downloads')

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),
        'noplaylist': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'progress_hooks': [progress_hook],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"🎵 Starting audio download from {url}...")
            ydl.download([url])
            print("✅ Audio download completed!")
    except Exception as e:
        print(f"❌ Error downloading audio: {e}")


@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    print("📩 Received request:", data)

    url = data.get('url')
    download_type = data.get('downloadType')

    if not url or not download_type:
        return jsonify({'error': 'Missing required fields'}), 400

    if download_type == 'video':
        download_video(url)
    elif download_type == 'audio':
        download_audio(url)
    else:
        return jsonify({'error': 'Unsupported download type'}), 400

    return jsonify({'status': 'Download started successfully'}), 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
