import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecorderService } from './services/audio-recorder.service';
import { GeminiService } from './services/gemini.service';
import { TtsService } from './services/tts.service';
import { ResultCardComponent } from './components/result-card.component';

interface TranslationResult {
  transcription: string;
  english: string;
  chinese: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ResultCardComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private audioService = inject(AudioRecorderService);
  private geminiService = inject(GeminiService);
  private ttsService = inject(TtsService);

  isRecording = this.audioService.isRecording;
  processing = signal(false);
  result = signal<TranslationResult | null>(null);
  error = signal<string | null>(null);

  async toggleRecording() {
    this.error.set(null);

    if (this.isRecording()) {
      await this.stopAndProcess();
    } else {
      await this.start();
    }
  }

  private async start() {
    this.result.set(null);
    try {
      await this.audioService.startRecording();
    } catch (err) {
      this.error.set('Could not access microphone. Please allow permissions.');
    }
  }

  private async stopAndProcess() {
    try {
      this.processing.set(true);
      const audioData = await this.audioService.stopRecording();
      
      const apiResult = await this.geminiService.processAudio(audioData.base64, audioData.mimeType);
      
      this.result.set(apiResult);
      
      // Auto-play english result for better UX
      if (apiResult.english) {
         setTimeout(() => this.playTts(apiResult.english, 'en-US'), 500);
      }

    } catch (err) {
      console.error(err);
      this.error.set('Failed to process audio. Please try again.');
    } finally {
      this.processing.set(false);
    }
  }

  playTts(text: string, lang: 'en-US' | 'zh-CN' | 'my-MM') {
    this.ttsService.speak(text, lang);
  }
}