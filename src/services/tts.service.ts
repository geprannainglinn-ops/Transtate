import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TtsService {
  
  speak(text: string, lang: 'en-US' | 'zh-CN' | 'my-MM') {
    if (!window.speechSynthesis) {
      console.warn("TTS not supported");
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a specific voice for better quality if available
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (lang === 'en-US') {
        selectedVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
    } else if (lang === 'zh-CN') {
        selectedVoice = voices.find(v => v.name.includes('Google Chinese')) || voices.find(v => v.lang === 'zh-CN');
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}