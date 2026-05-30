import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Role = 'customer' | 'vendor';
type AuthMode = 'signin' | 'signup';
type VerificationStatus = 'verified' | 'pending';
type PriceType = 'Fixed' | 'Negotiable';
type Tab = 'Home' | 'Reels' | 'Chats' | 'Saved' | 'Studio';
type IconName = keyof typeof Ionicons.glyphMap;

type Account = {
  email: string;
  password: string;
  role: Role;
  name: string;
  verificationStatus: VerificationStatus;
  hasSchoolIdEvidence: boolean;
};

type Listing = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  price: string;
  priceType: PriceType;
  rating: string;
  campus: string;
  description: string;
  image: string;
  tint: string;
  tags: string[];
};

type Reel = {
  id: string;
  vendor: string;
  title: string;
  views: string;
  caption: string;
  image: string;
};

const logo = require('./assets/stumart-logo.png');

const demoAccounts: Account[] = [
  {
    email: 'customer@stumart.app',
    password: 'Customer123',
    role: 'customer',
    name: 'Toni Customer',
    verificationStatus: 'verified',
    hasSchoolIdEvidence: false,
  },
  {
    email: 'vendor@stumart.app',
    password: 'Vendor123',
    role: 'vendor',
    name: 'Ama Vendor',
    verificationStatus: 'verified',
    hasSchoolIdEvidence: true,
  },
];

const listings: Listing[] = [
  {
    id: 'l1',
    title: 'Soft glam and wig styling',
    vendor: 'Ama Beauty Lab',
    category: 'Beauty',
    price: 'GHS 120',
    priceType: 'Negotiable',
    rating: '4.9',
    campus: 'Pentagon Hostel',
    description: 'Clean installs, soft glam touch-ups, and weekend slots for campus events and content days.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
    tint: '#a78bfa',
    tags: ['Hair', 'Event ready', 'Can bargain'],
  },
  {
    id: 'l2',
    title: 'Mini cake boxes',
    vendor: 'Kobby Bakes',
    category: 'Food',
    price: 'GHS 180',
    priceType: 'Fixed',
    rating: '4.8',
    campus: 'Legon Hall',
    description: 'Sweet boxes for birthdays, society hangouts, surprise deliveries, and late-night study treats.',
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
    tint: '#c084fc',
    tags: ['Cakes', 'Preorder', 'Delivery'],
  },
  {
    id: 'l3',
    title: 'Logo and brand kit',
    vendor: 'Nia Design Co.',
    category: 'Design',
    price: 'GHS 250',
    priceType: 'Negotiable',
    rating: '4.7',
    campus: 'Business School',
    description: 'Brand identity packs, launch flyers, and social templates for student founders and creators.',
    image:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80',
    tint: '#8b5cf6',
    tags: ['Branding', 'Flyers', 'Fast edits'],
  },
  {
    id: 'l4',
    title: 'Sneaker refresh',
    vendor: 'FreshStep Campus',
    category: 'Fashion',
    price: 'GHS 45',
    priceType: 'Fixed',
    rating: '4.6',
    campus: 'TF Hostel',
    description: 'Deep cleans, lace whitening, deodorizing, and same-day pickup for everyday campus sneakers.',
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80',
    tint: '#7c3aed',
    tags: ['Sneakers', 'Same day', 'Pickup'],
  },
];

const reels: Reel[] = [
  {
    id: 'r1',
    vendor: 'Ama Beauty Lab',
    title: 'Install reveal before the hall dinner',
    views: '8.2K',
    caption: 'A quick glow-up reel from booking to final look.',
    image:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'r2',
    vendor: 'Nia Design Co.',
    title: 'Sketch to launch-ready logo',
    views: '3.7K',
    caption: 'Turning a thrift brand idea into a clean campus identity.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'r3',
    vendor: 'Kobby Bakes',
    title: 'Packing a surprise cake box',
    views: '5.4K',
    caption: 'Small-batch treats for a hostel birthday surprise.',
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
  },
];

const chats = [
  {
    id: 'c1',
    vendor: 'Ama Beauty Lab',
    last: 'I can do GHS 100 if you book before Friday.',
    unread: 2,
  },
  {
    id: 'c2',
    vendor: 'FreshStep Campus',
    last: 'Send a photo of the sneakers and I will confirm timing.',
    unread: 0,
  },
  {
    id: 'c3',
    vendor: 'Nia Design Co.',
    last: 'The starter logo package includes two revisions.',
    unread: 1,
  },
];

const categories = ['All', 'Beauty', 'Food', 'Design', 'Fashion'];
const quickNeeds = ['Glow up', 'Birthday prep', 'Brand launch', 'Clean kicks'];

const tabConfig: Record<Tab, { icon: IconName; activeIcon: IconName }> = {
  Home: { icon: 'home-outline', activeIcon: 'home' },
  Reels: { icon: 'play-circle-outline', activeIcon: 'play-circle' },
  Chats: { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  Saved: { icon: 'heart-outline', activeIcon: 'heart' },
  Studio: { icon: 'sparkles-outline', activeIcon: 'sparkles' },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<Role>('customer');
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts);
  const [authMessage, setAuthMessage] = useState('');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [vendorEvidenceAttached, setVendorEvidenceAttached] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNeed, setActiveNeed] = useState(quickNeeds[0]);
  const [likedReels, setLikedReels] = useState<string[]>(['r1']);
  const [savedIds, setSavedIds] = useState<string[]>(['l2']);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
      const matchesSearch =
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.vendor.toLowerCase().includes(search.toLowerCase()) ||
        listing.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const savedListings = listings.filter((listing) => savedIds.includes(listing.id));

  const toggleSaved = (id: string) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  const toggleReelLike = (id: string) => {
    setLikedReels((current) =>
      current.includes(id) ? current.filter((reelId) => reelId !== id) : [...current, id],
    );
  };

  const resetAuthForm = () => {
    setAuthMessage('');
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setVendorEvidenceAttached(false);
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetAuthForm();
  };

  const handleSignin = () => {
    const normalizedEmail = authEmail.trim().toLowerCase();
    const account = accounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === authPassword && item.role === role,
    );

    if (!account) {
      setAuthMessage('No matching account found for this role.');
      return;
    }

    if (account.role === 'vendor' && account.verificationStatus !== 'verified') {
      setAuthMessage('Vendor account is still waiting for school ID verification.');
      return;
    }

    setAuthMessage('');
    setIsAuthenticated(true);
    setActiveTab(account.role === 'vendor' ? 'Studio' : 'Home');
  };

  const handleSignup = () => {
    const normalizedEmail = authEmail.trim().toLowerCase();
    const trimmedName = authName.trim();

    if (!trimmedName || !normalizedEmail || authPassword.length < 6) {
      setAuthMessage('Add your name, email, and a password with at least 6 characters.');
      return;
    }

    if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail && account.role === role)) {
      setAuthMessage('An account already exists for this role.');
      return;
    }

    if (role === 'vendor' && !vendorEvidenceAttached) {
      setAuthMessage('Vendors must attach school ID photo evidence before submission.');
      return;
    }

    const newAccount: Account = {
      email: normalizedEmail,
      password: authPassword,
      role,
      name: trimmedName,
      verificationStatus: role === 'vendor' ? 'pending' : 'verified',
      hasSchoolIdEvidence: role === 'vendor',
    };

    setAccounts((current) => [...current, newAccount]);

    if (role === 'vendor') {
      setAuthMode('signin');
      setAuthMessage('Vendor signup submitted. Login opens after school ID verification.');
      setAuthName('');
      setAuthPassword('');
      setVendorEvidenceAttached(false);
      Alert.alert('Verification needed', 'Your vendor account is pending school ID review before login is enabled.');
      return;
    }

    setAuthMessage('');
    setIsAuthenticated(true);
    setActiveTab('Home');
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#ffffff', '#f5edff', '#eadcff']} style={styles.loadingShell}>
        <StatusBar style="dark" />
        <View style={styles.loadingLogoWrap}>
          <Image source={logo} style={styles.loadingLogo} resizeMode="contain" />
        </View>
        <Text style={styles.loadingTitle}>Stumart</Text>
        <Text style={styles.loadingText}>Campus talent is loading...</Text>
      </LinearGradient>
    );
  }

  if (!isAuthenticated) {
    return (
      <LinearGradient colors={['#ffffff', '#fbf8ff', '#f3e8ff']} style={styles.authShell}>
        <StatusBar style="dark" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
          <View style={styles.authTopBar}>
            <Image source={logo} style={styles.authTopLogo} resizeMode="contain" />
          </View>

          <View style={styles.authHero}>
            <Text style={styles.authTitle}>{authMode === 'signin' ? 'Welcome Back!' : 'Create Account'}</Text>
            <View style={styles.segmentedControl}>
              {(['customer', 'vendor'] as Role[]).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setRole(option);
                    setAuthMessage('');
                  }}
                  style={[styles.segmentButton, role === option && styles.segmentButtonActive]}
                >
                  <Ionicons
                    name={option === 'customer' ? 'bag-handle-outline' : 'storefront-outline'}
                    size={17}
                    color={role === option ? '#ffffff' : '#7c3aed'}
                  />
                  <Text style={[styles.segmentText, role === option && styles.segmentTextActive]}>
                    {option === 'customer' ? 'Customer' : 'Vendor'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {authMode === 'signin' && (
            <View style={styles.authPanel}>
              <Pressable style={styles.googleButton}>
                <Ionicons name="logo-google" size={17} color="#ffffff" />
                <Text style={styles.googleButtonText}>Log In via Google</Text>
              </Pressable>
              <Text style={styles.troubleText}>Trouble logging in?</Text>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.formLabel}>Username or email</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder="customer@stumart.app"
                placeholderTextColor="#9f8fb8"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                placeholder="********"
                placeholderTextColor="#9f8fb8"
                secureTextEntry
                style={styles.underlinedInput}
              />
              <Pressable>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </Pressable>

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={handleSignin}>
                <Text style={styles.authSubmitText}>Log In</Text>
              </Pressable>
              <Pressable onPress={() => switchAuthMode('signup')}>
                <Text style={styles.authSwitchText}>Sign up if you don't have an account</Text>
              </Pressable>
            </View>
          )}

          {authMode === 'signup' && (
            <View style={styles.authPanel}>
              <Text style={styles.signupHint}>
                {role === 'vendor'
                  ? 'Vendor accounts need school ID evidence before approval.'
                  : 'Customer accounts can start browsing after signup.'}
              </Text>

              <Text style={styles.formLabel}>Full name</Text>
              <TextInput
                value={authName}
                onChangeText={setAuthName}
                placeholder={role === 'vendor' ? 'Vendor or brand owner name' : 'Your name'}
                placeholderTextColor="#9f8fb8"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Student email</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder={role === 'vendor' ? 'vendor@email.com' : 'student@email.com'}
                placeholderTextColor="#9f8fb8"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9f8fb8"
                secureTextEntry
                style={styles.underlinedInput}
              />

              {role === 'vendor' && (
                <Pressable
                  onPress={() => {
                    setVendorEvidenceAttached(true);
                    setAuthMessage('');
                  }}
                  style={[styles.evidenceButton, vendorEvidenceAttached && styles.evidenceButtonReady]}
                >
                  <Ionicons
                    name={vendorEvidenceAttached ? 'checkmark-circle' : 'camera-outline'}
                    size={20}
                    color={vendorEvidenceAttached ? '#ffffff' : '#7c3aed'}
                  />
                  <Text style={[styles.evidenceText, vendorEvidenceAttached && styles.evidenceTextReady]}>
                    {vendorEvidenceAttached ? 'School ID photo attached' : 'Attach school ID photo'}
                  </Text>
                </Pressable>
              )}

              {role === 'vendor' && (
                <View style={styles.verificationNote}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#7c3aed" />
                  <Text style={styles.verificationText}>
                    Vendor login stays locked until the ID evidence is reviewed and verified.
                  </Text>
                </View>
              )}

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={handleSignup}>
                <Text style={styles.authSubmitText}>
                  {role === 'vendor' ? 'Submit for Verification' : 'Create Account'}
                </Text>
              </Pressable>
              <Pressable onPress={() => switchAuthMode('signin')}>
                <Text style={styles.authSwitchText}>Already have an account? Log in</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo logins</Text>
            <Text style={styles.demoLine}>Customer: customer@stumart.app / Customer123</Text>
            <Text style={styles.demoLine}>Vendor: vendor@stumart.app / Vendor123</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={['#ffffff', '#f3e8ff']} style={styles.topCard}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
              <View>
                <Text style={styles.smallLabel}>Welcome back</Text>
                <Text style={styles.appTitle}>Stumart</Text>
              </View>
            </View>
            <Pressable style={styles.profilePill} onPress={() => setIsAuthenticated(false)}>
              <Text style={styles.profileInitial}>{role === 'customer' ? 'C' : 'V'}</Text>
            </Pressable>
          </View>
          <Text style={styles.heroLine}>What do you need before your next class break?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.needRow}>
            {quickNeeds.map((need) => (
              <Pressable
                key={need}
                onPress={() => setActiveNeed(need)}
                style={[styles.needChip, activeNeed === need && styles.needChipActive]}
              >
                <Text style={[styles.needChipText, activeNeed === need && styles.needChipTextActive]}>{need}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </LinearGradient>

        {activeTab === 'Home' && (
          <>
            <View style={styles.searchCard}>
              <Ionicons name="search" size={20} color="#7c3aed" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search braids, cakes, logos..."
                placeholderTextColor="#9f8fb8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}
                >
                  <Text
                    style={[styles.categoryChipText, activeCategory === category && styles.categoryChipTextActive]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Campus picks</Text>
              <Text style={styles.sectionMeta}>{filteredListings.length} near you</Text>
            </View>

            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSaved={savedIds.includes(listing.id)}
                onSave={() => toggleSaved(listing.id)}
                onOpen={() => setSelectedListing(listing)}
              />
            ))}

            {selectedListing && (
              <LinearGradient colors={['#8b5cf6', '#c084fc']} style={styles.detailPanel}>
                <Text style={styles.detailPanelTitle}>{selectedListing.title}</Text>
                <Text style={styles.detailVendor}>{selectedListing.vendor}</Text>
                <Text style={styles.detailPanelCopy}>{selectedListing.description}</Text>
                <View style={styles.actionRow}>
                  <Pressable style={styles.darkButton} onPress={() => setActiveTab('Chats')}>
                    <Ionicons name="chatbubble-ellipses" size={17} color="#ffffff" />
                    <Text style={styles.darkButtonText}>Message</Text>
                  </Pressable>
                  {selectedListing.priceType === 'Negotiable' && (
                    <Pressable style={styles.lightButton} onPress={() => setActiveTab('Chats')}>
                      <Ionicons name="pricetag" size={17} color="#7c3aed" />
                      <Text style={styles.lightButtonText}>Bargain</Text>
                    </Pressable>
                  )}
                </View>
              </LinearGradient>
            )}
          </>
        )}

        {activeTab === 'Reels' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vendor reels</Text>
              <Text style={styles.sectionMeta}>Tap hearts to save inspo</Text>
            </View>
            {reels.map((reel) => (
              <ImageBackground key={reel.id} source={{ uri: reel.image }} imageStyle={styles.reelImage} style={styles.reelCard}>
                <LinearGradient colors={['transparent', 'rgba(55, 28, 91, 0.92)']} style={styles.reelOverlay}>
                  <View style={styles.reelTopRow}>
                    <Text style={styles.reelBadge}>{reel.views} views</Text>
                    <Pressable style={styles.reelIconButton} onPress={() => toggleReelLike(reel.id)}>
                      <Ionicons
                        name={likedReels.includes(reel.id) ? 'heart' : 'heart-outline'}
                        size={22}
                        color={likedReels.includes(reel.id) ? '#f0abfc' : '#ffffff'}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.reelTitle}>{reel.title}</Text>
                  <Text style={styles.reelVendor}>{reel.vendor}</Text>
                  <Text style={styles.reelCaption}>{reel.caption}</Text>
                </LinearGradient>
              </ImageBackground>
            ))}
          </>
        )}

        {activeTab === 'Chats' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Campus chats</Text>
              <Text style={styles.sectionMeta}>Talk, plan, bargain</Text>
            </View>
            {chats.map((chat) => (
              <View key={chat.id} style={styles.chatRow}>
                <LinearGradient colors={['#c084fc', '#8b5cf6']} style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>{chat.vendor.slice(0, 1)}</Text>
                </LinearGradient>
                <View style={styles.chatBody}>
                  <Text style={styles.chatName}>{chat.vendor}</Text>
                  <Text style={styles.chatLast}>{chat.last}</Text>
                </View>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.negotiationBox}>
              <View style={styles.miniTitleRow}>
                <Ionicons name="sparkles" size={20} color="#7c3aed" />
                <Text style={styles.detailTitle}>Bargain buddy</Text>
              </View>
              <Text style={styles.detailCopy}>
                Send a friendly offer, let vendors counter, and keep the whole deal inside chat.
              </Text>
              <View style={styles.offerRow}>
                {['GHS 80', 'GHS 100', 'GHS 150'].map((offer) => (
                  <Pressable key={offer} style={styles.offerChip}>
                    <Text style={styles.offerChipText}>{offer}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput placeholder="Type your own offer" placeholderTextColor="#9f8fb8" style={styles.input} />
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Send offer</Text>
                <Ionicons name="send" size={17} color="#ffffff" />
              </Pressable>
            </View>
          </>
        )}

        {activeTab === 'Saved' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your saved list</Text>
              <Text style={styles.sectionMeta}>{savedListings.length} favorite</Text>
            </View>
            {savedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSaved
                onSave={() => toggleSaved(listing.id)}
                onOpen={() => setSelectedListing(listing)}
              />
            ))}
            {savedListings.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={32} color="#a78bfa" />
                <Text style={styles.emptyTitle}>Nothing saved yet</Text>
                <Text style={styles.emptyCopy}>Heart the vendors you want to compare after lectures.</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'Studio' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vendor studio</Text>
              <Text style={styles.sectionMeta}>Build your page</Text>
            </View>
            <LinearGradient colors={['#8b5cf6', '#c084fc']} style={styles.studioHero}>
              <Image source={logo} style={styles.studioLogo} resizeMode="contain" />
              <Text style={styles.studioTitle}>Turn your skill into a campus storefront.</Text>
              <Text style={styles.studioCopy}>
                Add a service, set fixed or negotiable pricing, post reels, and reply to customers from one soft
                little workspace.
              </Text>
            </LinearGradient>
            {[
              { title: 'Create product or service', icon: 'add-circle-outline' as IconName },
              { title: 'Upload reel', icon: 'cloud-upload-outline' as IconName },
              { title: 'Set price rules', icon: 'pricetags-outline' as IconName },
              { title: 'Review offers', icon: 'receipt-outline' as IconName },
            ].map((item) => (
              <Pressable key={item.title} style={styles.studioAction}>
                <View style={styles.studioActionLeft}>
                  <Ionicons name={item.icon} size={22} color="#7c3aed" />
                  <Text style={styles.studioActionText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a78bfa" />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {(role === 'vendor'
          ? (['Home', 'Reels', 'Chats', 'Saved', 'Studio'] as Tab[])
          : (['Home', 'Reels', 'Chats', 'Saved'] as Tab[])
        ).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Ionicons
                name={isActive ? tabConfig[tab].activeIcon : tabConfig[tab].icon}
                size={19}
                color={isActive ? '#ffffff' : '#8b7aa8'}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function ListingCard({
  listing,
  isSaved,
  onSave,
  onOpen,
}: {
  listing: Listing;
  isSaved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <Pressable onPress={onOpen} style={styles.listingCard}>
      <ImageBackground source={{ uri: listing.image }} imageStyle={styles.listingImage} style={styles.listingMedia}>
        <LinearGradient colors={['transparent', 'rgba(64, 30, 103, 0.72)']} style={styles.mediaShade}>
          <View style={[styles.priceTag, { backgroundColor: listing.tint }]}>
            <Text style={styles.priceText}>{listing.price}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.listingInfo}>
        <View style={styles.listingTitleRow}>
          <View style={styles.flex}>
            <Text style={styles.listingTitle}>{listing.title}</Text>
            <Text style={styles.vendorName}>{listing.vendor}</Text>
          </View>
          <Pressable onPress={onSave} style={[styles.saveButton, isSaved && styles.saveButtonActive]}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={17} color={isSaved ? '#7c3aed' : '#9f8fb8'} />
            <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{listing.category}</Text>
          <Text style={styles.metaText}>{listing.priceType}</Text>
          <Text style={styles.metaText}>{listing.rating}</Text>
        </View>
        <View style={styles.campusRow}>
          <Ionicons name="location-outline" size={15} color="#7c3aed" />
          <Text style={styles.campusText}>{listing.campus}</Text>
        </View>
        <View style={styles.tagRow}>
          {listing.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#fbf8ff',
  },
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  loadingLogoWrap: {
    width: 138,
    height: 138,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  loadingLogo: {
    width: 112,
    height: 112,
  },
  loadingTitle: {
    color: '#4c1d95',
    fontFamily: 'sans-serif-rounded',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 20,
  },
  loadingText: {
    color: '#7e6aa7',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  authShell: {
    flex: 1,
  },
  authScroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 26,
  },
  authTopBar: {
    height: 88,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  authTopLogo: {
    width: 46,
    height: 46,
  },
  authHero: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  authTitle: {
    color: '#251044',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 18,
  },
  authPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 22,
    gap: 11,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  segmentedControl: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#f5edff',
    borderRadius: 22,
    padding: 5,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  segmentButtonActive: {
    backgroundColor: '#9b5cff',
  },
  segmentText: {
    color: '#7c3aed',
    fontWeight: '800',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#fbf8ff',
    borderWidth: 1,
    borderColor: '#eadcff',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: '#251044',
  },
  googleButton: {
    backgroundColor: '#251044',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  googleButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  troubleText: {
    color: '#8b7aa8',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eadcff',
  },
  dividerText: {
    color: '#b4a5ca',
    fontWeight: '900',
    fontSize: 12,
  },
  formLabel: {
    color: '#a798bd',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  underlinedInput: {
    color: '#251044',
    borderBottomWidth: 1,
    borderBottomColor: '#9f8fb8',
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  forgotLink: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },
  authMessage: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  authSubmitButton: {
    backgroundColor: '#9b5cff',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  authSubmitText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
  authSwitchText: {
    color: '#6f5d8d',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 2,
  },
  signupHint: {
    color: '#6f5d8d',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 3,
  },
  evidenceButton: {
    borderWidth: 1,
    borderColor: '#d8c4ff',
    backgroundColor: '#fbf8ff',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  evidenceButtonReady: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  evidenceText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  evidenceTextReady: {
    color: '#ffffff',
  },
  verificationNote: {
    backgroundColor: '#f5edff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  verificationText: {
    flex: 1,
    color: '#6f5d8d',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  demoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: '#eadcff',
    borderRadius: 20,
    padding: 14,
    marginTop: 16,
  },
  demoTitle: {
    color: '#251044',
    fontWeight: '900',
    marginBottom: 6,
  },
  demoLine: {
    color: '#6f5d8d',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#9b5cff',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
  linkText: {
    color: '#7c3aed',
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 112,
  },
  topCard: {
    borderRadius: 30,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  smallLabel: {
    color: '#8b7aa8',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  appTitle: {
    color: '#251044',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0,
  },
  profilePill: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  profileInitial: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  heroLine: {
    color: '#4c1d95',
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
    marginTop: 18,
  },
  needRow: {
    marginTop: 14,
  },
  needChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    marginRight: 9,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  needChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  needChipText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  needChipTextActive: {
    color: '#ffffff',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#eadcff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#251044',
    fontSize: 16,
    fontWeight: '700',
  },
  categoryRow: {
    marginVertical: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  categoryChipActive: {
    backgroundColor: '#efe3ff',
    borderColor: '#c4b5fd',
  },
  categoryChipText: {
    color: '#8b7aa8',
    fontWeight: '900',
  },
  categoryChipTextActive: {
    color: '#6d28d9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#251044',
    fontSize: 23,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#8b7aa8',
    fontWeight: '800',
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  listingMedia: {
    height: 158,
  },
  listingImage: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  mediaShade: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  priceTag: {
    margin: 12,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  priceText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  listingInfo: {
    padding: 15,
  },
  listingTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  listingTitle: {
    color: '#251044',
    fontSize: 19,
    fontWeight: '900',
  },
  vendorName: {
    color: '#7f6a9f',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  saveButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#eadcff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  saveButtonActive: {
    backgroundColor: '#f3e8ff',
    borderColor: '#c4b5fd',
  },
  saveButtonText: {
    color: '#8b7aa8',
    fontWeight: '900',
  },
  saveButtonTextActive: {
    color: '#7c3aed',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metaText: {
    backgroundColor: '#f6efff',
    color: '#6d28d9',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
  },
  campusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  campusText: {
    color: '#6f5d8d',
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    color: '#4c1d95',
    backgroundColor: '#fbf8ff',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
  },
  detailPanel: {
    borderRadius: 26,
    padding: 18,
    marginTop: 2,
    marginBottom: 8,
  },
  detailTitle: {
    color: '#251044',
    fontSize: 20,
    fontWeight: '900',
  },
  detailPanelTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
  },
  detailVendor: {
    color: '#f5edff',
    fontWeight: '900',
    marginTop: 6,
  },
  detailPanelCopy: {
    color: '#fbf8ff',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  detailCopy: {
    color: '#6f5d8d',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  darkButton: {
    flex: 1,
    backgroundColor: '#4c1d95',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  darkButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  lightButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  lightButtonText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  reelCard: {
    height: 430,
    marginBottom: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: '#4c1d95',
  },
  reelImage: {
    borderRadius: 30,
  },
  reelOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  reelTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelBadge: {
    color: '#ffffff',
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontWeight: '900',
  },
  reelIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelTitle: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '900',
  },
  reelVendor: {
    color: '#f0abfc',
    fontWeight: '900',
    marginTop: 6,
  },
  reelCaption: {
    color: '#f8f1ff',
    lineHeight: 21,
    marginTop: 8,
  },
  chatRow: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  chatBody: {
    flex: 1,
  },
  chatName: {
    color: '#251044',
    fontWeight: '900',
    fontSize: 16,
  },
  chatLast: {
    color: '#7f6a9f',
    marginTop: 4,
    lineHeight: 19,
  },
  unreadBadge: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  negotiationBox: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eadcff',
    gap: 12,
  },
  miniTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  offerChip: {
    backgroundColor: '#f3e8ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  offerChipText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  emptyTitle: {
    color: '#251044',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  emptyCopy: {
    color: '#7f6a9f',
    marginTop: 8,
    textAlign: 'center',
  },
  studioHero: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
  },
  studioLogo: {
    width: 56,
    height: 56,
    marginBottom: 14,
  },
  studioTitle: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },
  studioCopy: {
    color: '#f8f1ff',
    lineHeight: 22,
    marginTop: 10,
  },
  studioAction: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eadcff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studioActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  studioActionText: {
    color: '#251044',
    fontSize: 16,
    fontWeight: '900',
  },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    flexDirection: 'row',
    padding: 7,
    borderWidth: 1,
    borderColor: '#eadcff',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 9,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 22,
    gap: 3,
  },
  tabButtonActive: {
    backgroundColor: '#9b5cff',
  },
  tabText: {
    color: '#8b7aa8',
    fontSize: 11,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
