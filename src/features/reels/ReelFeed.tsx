import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, StyleSheet, Dimensions, ViewToken } from 'react-native';
import ReelPlayer from './ReelPlayer';
import { fetchReels, trackEvent } from '../../services/reelsService';
import type { Reel } from './types';

const { height } = Dimensions.get('window');

export default function ReelFeed() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 75 }).current;

  useEffect(() => {
    (async () => {
      const data = await fetchReels();
      setReels(data);
    })();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (!viewableItems || viewableItems.length === 0) return;
    const first = viewableItems[0];
    const idx = first.index ?? 0;
    setActiveIndex(idx);
    trackEvent('reel_view', { reelId: first.item.id });
  }).current;

  const renderItem = useCallback(({ item, index }: { item: Reel; index: number }) => (
    <View style={{ height }}>
      <ReelPlayer
        reel={item}
        isActive={index === activeIndex}
        onLike={(id) => trackEvent('reel_like', { id })}
        onShare={(r) => trackEvent('reel_share', { id: r.id })}
        onSave={(id) => trackEvent('reel_save', { id })}
        onOpenProfile={(vendor) => trackEvent('open_profile', { vendor })}
        onBook={(id) => trackEvent('reel_book', { id })}
      />
    </View>
  ), [activeIndex]);

  return (
    <FlatList
      data={reels}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      pagingEnabled
      decelerationRate="fast"
      snapToInterval={height}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
});
