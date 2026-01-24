"""
複数の歌詞APIを併用するフォールバックシステム
LRCLIB → Genius → Musixmatch → AZLyrics の順で試行
"""

import aiohttp
import asyncio
import re
import os
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

# API設定
GENIUS_API_TOKEN = os.getenv("GENIUS_API_TOKEN", "")
MUSIXMATCH_API_KEY = os.getenv("MUSIXMATCH_API_KEY", "")


class MultiLyricsAPI:
    """複数の歌詞APIを統合したクラス"""
    
    def __init__(self):
        self.session = None
        self.api_stats = {
            "lrclib": {"success": 0, "fail": 0},
            "genius": {"success": 0, "fail": 0},
            "musixmatch": {"success": 0, "fail": 0},
            "azlyrics": {"success": 0, "fail": 0}
        }
    
    async def get_session(self):
        """HTTPセッションを取得"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """セッションをクローズ"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    # ==========================================
    # メイン関数: 全APIを試行
    # ==========================================
    async def fetch_lyrics(self, track_title: str, artist: str = "") -> Optional[Dict]:
        """
        複数のAPIを順番に試して歌詞を取得
        
        Returns:
            {
                "lyrics": str,
                "source": str,  # "lrclib", "genius", etc.
                "synced": bool,  # タイムスタンプ付きか
                "plain": str     # プレーンテキスト
            }
        """
        logger.info(f"🔍 Searching lyrics for: {track_title} - {artist}")
        
        # 1. LRCLIB (タイムスタンプ付き歌詞)
        result = await self._try_lrclib(track_title, artist)
        if result:
            return result
        
        # 2. Genius (高品質な歌詞)
        result = await self._try_genius(track_title, artist)
        if result:
            return result
        
        # 3. Musixmatch (多言語対応)
        result = await self._try_musixmatch(track_title, artist)
        if result:
            return result
        
        # 4. AZLyrics (フォールバック)
        result = await self._try_azlyrics(track_title, artist)
        if result:
            return result
        
        logger.warning(f"❌ No lyrics found for: {track_title}")
        return None
    
    # ==========================================
    # 1. LRCLIB API
    # ==========================================
    async def _try_lrclib(self, track_title: str, artist: str) -> Optional[Dict]:
        """LRCLIB APIで歌詞を取得（タイムスタンプ付き）"""
        try:
            session = await self.get_session()
            
            # クエリを作成
            params = {
                "track_name": track_title,
                "artist_name": artist
            }
            
            url = "https://lrclib.net/api/get"
            async with session.get(url, params=params, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # タイムスタンプ付き歌詞
                    synced_lyrics = data.get("syncedLyrics")
                    plain_lyrics = data.get("plainLyrics")
                    
                    if synced_lyrics or plain_lyrics:
                        self.api_stats["lrclib"]["success"] += 1
                        logger.info("✅ Found lyrics on LRCLIB")
                        
                        return {
                            "lyrics": synced_lyrics or plain_lyrics,
                            "source": "lrclib",
                            "synced": bool(synced_lyrics),
                            "plain": plain_lyrics or synced_lyrics
                        }
                
                logger.debug(f"LRCLIB returned {response.status}")
                self.api_stats["lrclib"]["fail"] += 1
                
        except asyncio.TimeoutError:
            logger.warning("⏱️ LRCLIB timeout")
            self.api_stats["lrclib"]["fail"] += 1
        except Exception as e:
            logger.error(f"❌ LRCLIB error: {e}")
            self.api_stats["lrclib"]["fail"] += 1
        
        return None
    
    # ==========================================
    # 2. Genius API
    # ==========================================
    async def _try_genius(self, track_title: str, artist: str) -> Optional[Dict]:
        """Genius APIで歌詞を取得"""
        if not GENIUS_API_TOKEN:
            logger.debug("Genius API token not set")
            return None
        
        try:
            session = await self.get_session()
            
            # 曲を検索
            search_url = "https://api.genius.com/search"
            headers = {"Authorization": f"Bearer {GENIUS_API_TOKEN}"}
            params = {"q": f"{track_title} {artist}"}
            
            async with session.get(search_url, headers=headers, params=params, timeout=10) as response:
                if response.status != 200:
                    self.api_stats["genius"]["fail"] += 1
                    return None
                
                data = await response.json()
                hits = data.get("response", {}).get("hits", [])
                
                if not hits:
                    self.api_stats["genius"]["fail"] += 1
                    return None
                
                # 最初の結果を使用
                song_url = hits[0]["result"]["url"]
                
                # 歌詞ページをスクレイピング（簡易版）
                async with session.get(song_url, timeout=10) as lyrics_response:
                    if lyrics_response.status == 200:
                        html = await lyrics_response.text()
                        
                        # 歌詞を抽出（簡易的な方法）
                        # 実際にはBeautifulSoupなどを使用することを推奨
                        lyrics = self._extract_genius_lyrics(html)
                        
                        if lyrics:
                            self.api_stats["genius"]["success"] += 1
                            logger.info("✅ Found lyrics on Genius")
                            
                            return {
                                "lyrics": lyrics,
                                "source": "genius",
                                "synced": False,
                                "plain": lyrics
                            }
            
            self.api_stats["genius"]["fail"] += 1
            
        except asyncio.TimeoutError:
            logger.warning("⏱️ Genius timeout")
            self.api_stats["genius"]["fail"] += 1
        except Exception as e:
            logger.error(f"❌ Genius error: {e}")
            self.api_stats["genius"]["fail"] += 1
        
        return None
    
    def _extract_genius_lyrics(self, html: str) -> Optional[str]:
        """GeniusのHTMLから歌詞を抽出（簡易版）"""
        try:
            # data-lyrics-container を探す
            pattern = r'<div[^>]*data-lyrics-container[^>]*>(.*?)</div>'
            matches = re.findall(pattern, html, re.DOTALL)
            
            if matches:
                lyrics = ""
                for match in matches:
                    # HTMLタグを削除
                    text = re.sub(r'<[^>]+>', '\n', match)
                    lyrics += text
                
                # クリーンアップ
                lyrics = re.sub(r'\n+', '\n', lyrics)
                lyrics = lyrics.strip()
                
                return lyrics if lyrics else None
        except Exception as e:
            logger.error(f"Error extracting Genius lyrics: {e}")
        
        return None
    
    # ==========================================
    # 3. Musixmatch API
    # ==========================================
    async def _try_musixmatch(self, track_title: str, artist: str) -> Optional[Dict]:
        """Musixmatch APIで歌詞を取得"""
        if not MUSIXMATCH_API_KEY:
            logger.debug("Musixmatch API key not set")
            return None
        
        try:
            session = await self.get_session()
            
            # 曲を検索
            search_url = "https://api.musixmatch.com/ws/1.1/track.search"
            params = {
                "q_track": track_title,
                "q_artist": artist,
                "apikey": MUSIXMATCH_API_KEY,
                "page_size": 1
            }
            
            async with session.get(search_url, params=params, timeout=10) as response:
                if response.status != 200:
                    self.api_stats["musixmatch"]["fail"] += 1
                    return None
                
                data = await response.json()
                track_list = data.get("message", {}).get("body", {}).get("track_list", [])
                
                if not track_list:
                    self.api_stats["musixmatch"]["fail"] += 1
                    return None
                
                track_id = track_list[0]["track"]["track_id"]
                
                # 歌詞を取得
                lyrics_url = "https://api.musixmatch.com/ws/1.1/track.lyrics.get"
                params = {
                    "track_id": track_id,
                    "apikey": MUSIXMATCH_API_KEY
                }
                
                async with session.get(lyrics_url, params=params, timeout=10) as lyrics_response:
                    if lyrics_response.status == 200:
                        lyrics_data = await lyrics_response.json()
                        lyrics_body = lyrics_data.get("message", {}).get("body", {}).get("lyrics", {}).get("lyrics_body")
                        
                        if lyrics_body:
                            self.api_stats["musixmatch"]["success"] += 1
                            logger.info("✅ Found lyrics on Musixmatch")
                            
                            return {
                                "lyrics": lyrics_body,
                                "source": "musixmatch",
                                "synced": False,
                                "plain": lyrics_body
                            }
            
            self.api_stats["musixmatch"]["fail"] += 1
            
        except asyncio.TimeoutError:
            logger.warning("⏱️ Musixmatch timeout")
            self.api_stats["musixmatch"]["fail"] += 1
        except Exception as e:
            logger.error(f"❌ Musixmatch error: {e}")
            self.api_stats["musixmatch"]["fail"] += 1
        
        return None
    
    # ==========================================
    # 4. AZLyrics (スクレイピング)
    # ==========================================
    async def _try_azlyrics(self, track_title: str, artist: str) -> Optional[Dict]:
        """AZLyricsから歌詞を取得（スクレイピング）"""
        try:
            session = await self.get_session()
            
            # URLを生成
            clean_artist = re.sub(r'[^a-z0-9]', '', artist.lower())
            clean_title = re.sub(r'[^a-z0-9]', '', track_title.lower())
            url = f"https://www.azlyrics.com/lyrics/{clean_artist}/{clean_title}.html"
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            async with session.get(url, headers=headers, timeout=10) as response:
                if response.status == 200:
                    html = await response.text()
                    
                    # 歌詞を抽出
                    lyrics = self._extract_azlyrics(html)
                    
                    if lyrics:
                        self.api_stats["azlyrics"]["success"] += 1
                        logger.info("✅ Found lyrics on AZLyrics")
                        
                        return {
                            "lyrics": lyrics,
                            "source": "azlyrics",
                            "synced": False,
                            "plain": lyrics
                        }
            
            self.api_stats["azlyrics"]["fail"] += 1
            
        except asyncio.TimeoutError:
            logger.warning("⏱️ AZLyrics timeout")
            self.api_stats["azlyrics"]["fail"] += 1
        except Exception as e:
            logger.error(f"❌ AZLyrics error: {e}")
            self.api_stats["azlyrics"]["fail"] += 1
        
        return None
    
    def _extract_azlyrics(self, html: str) -> Optional[str]:
        """AZLyricsのHTMLから歌詞を抽出"""
        try:
            # 歌詞部分を抽出
            pattern = r'<!-- Usage of azlyrics.com content.*?-->(.*?)<!-- MxM banner -->'
            match = re.search(pattern, html, re.DOTALL)
            
            if match:
                lyrics = match.group(1)
                # HTMLタグを削除
                lyrics = re.sub(r'<[^>]+>', '', lyrics)
                lyrics = lyrics.strip()
                
                return lyrics if lyrics else None
        except Exception as e:
            logger.error(f"Error extracting AZLyrics: {e}")
        
        return None
    
    # ==========================================
    # 統計情報
    # ==========================================
    def get_stats(self) -> Dict:
        """API使用統計を取得"""
        stats = {}
        for api, counts in self.api_stats.items():
            total = counts["success"] + counts["fail"]
            success_rate = (counts["success"] / total * 100) if total > 0 else 0
            stats[api] = {
                "success": counts["success"],
                "fail": counts["fail"],
                "total": total,
                "success_rate": f"{success_rate:.1f}%"
            }
        return stats
    
    def print_stats(self):
        """統計情報を表示"""
        logger.info("📊 Lyrics API Statistics:")
        for api, stats in self.get_stats().items():
            logger.info(f"  {api}: {stats['success']}/{stats['total']} ({stats['success_rate']})")


# ==========================================
# グローバルインスタンス
# ==========================================
lyrics_api = MultiLyricsAPI()


# ==========================================
# 使用例
# ==========================================
async def main():
    """テスト用"""
    # 歌詞を取得
    result = await lyrics_api.fetch_lyrics("なまらめんこいギャル", "Super Adorable Gal")
    
    if result:
        print(f"✅ Found lyrics from {result['source']}")
        print(f"Synced: {result['synced']}")
        print(f"Lyrics preview: {result['lyrics'][:200]}...")
    else:
        print("❌ No lyrics found")
    
    # 統計を表示
    lyrics_api.print_stats()
    
    # クリーンアップ
    await lyrics_api.close()


if __name__ == "__main__":
    asyncio.run(main())
