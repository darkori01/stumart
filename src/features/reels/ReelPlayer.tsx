import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import type { Reel } from './types';

type Props = {
  reel: Reel;
  isActive: boolean;
  onLike: (id: string) => void;
  onShare: (r: Reel) => void;
  onSave: (id: string) => void;
  onOpenProfile: (vendor: string) => void;
  onBook: (id: string) => void;
};

export default function ReelPlayer({ reel, isActive, onLike, onShare, onSave, onOpenProfile, onBook }: Props) {
  const videoRef = useRef<any | null>(null);
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!videoRef.current) return;
      try {
        if (isActive) {
          await videoRef.current.playAsync();
        } else {
          await videoRef.current.pauseAsync();
        }
      } catch (e) {
        // ignore
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Video
        ref={(ref:any) => (videoRef.current = ref)}
        source={{ uri: reel.videoUrl }}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay={isActive}
        onPlaybackStatusUpdate={(s:any) => setStatus(s)}
      />

      {loading && <ActivityIndicator style={styles.loader} color="#fff" />}

      <View style={styles.infoColumn} pointerEvents="box-none">
        <Pressable onPress={() => onOpenProfile(reel.vendor)} style={styles.vendorRow}>
          <Text style={styles.vendorHandle}>@{reel.vendor}</Text>
          {reel.verified && <Ionicons name="checkmark-circle" size={16} color={theme.colors.purple500} />}
        </Pressable>
        <Text style={styles.caption}>{reel.caption}</Text>

        <View style={styles.actions}>
          <Pressable onPress={() => onLike(reel.id)} style={styles.actionButton}><Ionicons name="heart-outline" size={28} color="#fff" /><Text style={styles.actionLabel}>{reel.likes}</Text></Pressable>
          <Pressable onPress={() => onShare(reel)} style={styles.actionButton}><Ionicons name="share-social-outline" size={28} color="#fff" /></Pressable>
          <Pressable onPress={() => onSave(reel.id)} style={styles.actionButton}><Ionicons name="bookmark-outline" size={28} color="#fff" /></Pressable>
        </View>

        <View style={styles.ctaRow}>
          <Pressable style={styles.cta} onPress={() => onBook(reel.id)}><Text style={styles.ctaText}>Book Service</Text></Pressable>
          <Pressable style={[styles.cta, { backgroundColor: '#fff' }]} onPress={() => onOpenProfile(reel.vendor)}><Text style={[styles.ctaText, { color: '#2b0b3a' }]}>View Shop</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', backgroundColor: '#000' },
  video: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  loader: { position: 'absolute', alignSelf: 'center', top: '50%' },
  infoColumn: { position: 'absolute', left: 12, bottom: 32, right: 80 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  vendorHandle: { color: '#fff', fontWeight: '700' },
  caption: { color: '#efe1ff', marginBottom: 10 },
  actions: { position: 'absolute', right: 12, bottom: 80, alignItems: 'center' },
  actionButton: { alignItems: 'center', marginBottom: 18 },
  actionLabel: { color: '#fff', marginTop: 6 },
  ctaRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cta: { backgroundColor: theme.colors.purple700, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  ctaText: { color: '#fff', fontWeight: '800' },
});
