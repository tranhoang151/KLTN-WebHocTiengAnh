# YouTube ID Extraction Test

## Test Cases:

### Video URLs from Database:
1. **Lesson 3: Colors** - `https://www.youtube.com/watch?v=qhOTU8_1Af4`
   - Expected YouTube ID: `qhOTU8_1Af4`
2. **Lesson 2: Counting** - `https://www.youtube.com/watch?v=NZSt4JEtSkI`
   - Expected YouTube ID: `NZSt4JEtSkI`
3. **Lesson 1: The Alphabet** - `https://www.youtube.com/watch?v=9XW3jTNeZjg`
   - Expected YouTube ID: `9XW3jTNeZjg`

## Test the extractYouTubeId function:

```javascript
const extractYouTubeId = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || '';
  } catch (e) {
    // Fallback for youtu.be links or other formats
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|watch\?v=|embed\/|v\/)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : '';
  }
};

// Test cases:
console.log(extractYouTubeId('https://www.youtube.com/watch?v=qhOTU8_1Af4')); // Should return: qhOTU8_1Af4
console.log(extractYouTubeId('https://www.youtube.com/watch?v=NZSt4JEtSkI')); // Should return: NZSt4JEtSkI
console.log(extractYouTubeId('https://www.youtube.com/watch?v=9XW3jTNeZjg')); // Should return: 9XW3jTNeZjg
```

## Expected Results:
- All three URLs should extract the correct YouTube IDs
- The YouTube player should load with these IDs
- Videos should be playable

## Debug Steps:
1. Check console logs for:
   - "Fetching video with ID: [videoId]"
   - "Fetched video: [video object]"
   - "Video URL: [url]"
   - "Extracted YouTube ID: [id]"
   - "Rendering YouTube player with video ID: [id]"
   - "YouTube player ready for video ID: [id]"

2. If YouTube ID extraction fails:
   - Check if video.videoUrl is correct
   - Verify the URL format
   - Test the regex pattern

3. If YouTube player doesn't load:
   - Check for YouTube API errors
   - Verify react-youtube package is working
   - Check browser console for errors
