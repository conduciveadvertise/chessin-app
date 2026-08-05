import AsyncStorage from "@react-native-async-storage/async-storage";
import { OfflineMatchRecord } from "../types/tournament";

const STORAGE_KEYS = {
  MATCH_HISTORY: "chess_in_offline_matches",
  PUZZLE_PROGRESS: "chess_in_offline_puzzles",
  LESSON_PROGRESS: "chess_in_offline_lessons",
  OFFLINE_ANALYSIS: "chess_in_offline_analysis",
};

export class OfflineStorageRepository {
  private inMemoryCache: Record<string, string> = {};

  async saveOfflineMatch(match: Omit<OfflineMatchRecord, "id" | "playedAt" | "synced">): Promise<OfflineMatchRecord> {
    const history = await this.getOfflineMatchHistory();
    const newRecord: OfflineMatchRecord = {
      ...match,
      id: "off_m_" + Date.now(),
      playedAt: new Date().toISOString(),
      synced: false,
    };
    history.unshift(newRecord);
    await AsyncStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history));
    return newRecord;
  }

  async getOfflineMatchHistory(): Promise<OfflineMatchRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveOfflinePuzzleSolved(puzzleId: string): Promise<void> {
    try {
      const solved = await this.getOfflinePuzzleProgress();
      if (!solved.includes(puzzleId)) {
        solved.push(puzzleId);
        await AsyncStorage.setItem(STORAGE_KEYS.PUZZLE_PROGRESS, JSON.stringify(solved));
      }
    } catch (e) {
      console.warn("Failed saving puzzle progress offline", e);
    }
  }

  async getOfflinePuzzleProgress(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PUZZLE_PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveOfflineLessonProgress(lessonId: string): Promise<void> {
    try {
      const completed = await this.getOfflineLessonProgress();
      if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        await AsyncStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(completed));
      }
    } catch (e) {
      console.warn("Failed saving lesson progress offline", e);
    }
  }

  async getOfflineLessonProgress(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async syncOfflineDataToServer(): Promise<{ syncedCount: number }> {
    const history = await this.getOfflineMatchHistory();
    const unsynced = history.filter((m) => !m.synced);
    if (unsynced.length === 0) return { syncedCount: 0 };

    const updated = history.map((m) => ({ ...m, synced: true }));
    await AsyncStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));

    return { syncedCount: unsynced.length };
  }
}

export const offlineStorageRepository = new OfflineStorageRepository();
