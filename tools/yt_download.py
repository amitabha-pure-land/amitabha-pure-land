import sys

print(sys.argv)
from pytube import YouTube

youtube_video_url = sys.argv[1]
folder = sys.argv[2] if len(sys.argv) > 2 else '.'

retries = 5
while retries > 0:
    try:
        youtube_video = YouTube(youtube_video_url)
        filename = folder + '/' + youtube_video.title + '-720p.mp4'
        stream720p = youtube_video.streams.filter(type="video", res="720p")
        if len(stream720p) > 0:
            print("downloading: " + filename)
            stream720p.first().download(filename=filename)
        else:
            print("skipped " + filename)
        break
    except:
        retries -= 1
        print("retry: " + youtube_video_url)

