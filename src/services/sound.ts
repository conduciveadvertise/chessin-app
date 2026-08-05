import * as Haptics from "expo-haptics";

class ChessSoundManager {
  public enabled: boolean = true;

  playMove() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics fallback
    }
  }

  playCapture() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics fallback
    }
  }

  playCheck() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      // Haptics fallback
    }
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Haptics fallback
    }
  }

  playDefeat() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Haptics fallback
    }
  }

  playGameStart() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Haptics fallback
    }
  }

  playTimerTick() {
    if (!this.enabled) return;
    try {
      Haptics.selectionAsync();
    } catch (e) {
      // Haptics fallback
    }
  }
}

export const soundManager = new ChessSoundManager();
