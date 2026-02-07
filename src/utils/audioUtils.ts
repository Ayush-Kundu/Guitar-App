/**
 * Audio utilities for recording and converting audio
 */

// Convert AudioBuffer to WAV format
export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  // Interleave channels
  const length = buffer.length * numChannels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);
  
  // Write audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return arrayBuffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Convert Blob to WAV
export async function convertToWav(blob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = audioBufferToWav(audioBuffer);
    audioContext.close();
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } catch (error) {
    console.error('Error converting to WAV:', error);
    audioContext.close();
    throw error;
  }
}

// Save audio file to server (audio folder)
export async function saveAudioToServer(blob: Blob, filename: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('audio', blob, filename);
    
    const response = await fetch('/api/save-audio', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      console.log('✅ Audio saved to server:', filename);
      return true;
    } else {
      console.error('❌ Failed to save audio:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving audio:', error);
    return false;
  }
}

