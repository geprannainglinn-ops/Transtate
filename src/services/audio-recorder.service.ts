import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  isRecording = signal(false);
  
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      throw err;
    }
  }

  stopRecording(): Promise<{ base64: string, mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject('No recording in progress');
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Format is "data:audio/webm;base64,....."
          const base64Data = base64String.split(',')[1];
          resolve({ base64: base64Data, mimeType: 'audio/webm' });
        };
        reader.onerror = (error) => reject(error);
        
        this.isRecording.set(false);
        this.stream?.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.stop();
    });
  }

  private get stream() {
    return this.mediaRecorder?.stream;
  }
}