import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
type AuthFlow =
  | 'signin'
  | 'signupEmail'
  | 'signupCode'
  | 'signupPassword'
  | 'google'
  | 'forgotEmail'
  | 'forgotCode'
  | 'forgotPassword';
type VerificationPurpose = 'signup' | 'forgot';
type VerificationStatus = 'verified' | 'pending';
type PriceType = 'Fixed' | 'Negotiable';
type ListingKind = 'Product' | 'Skill';
type Tab = 'Home' | 'Dashboard' | 'Products' | 'Reels' | 'Chats' | 'Saved' | 'Studio';
type StudioMode = 'menu' | 'addListing';
type IconName = keyof typeof Ionicons.glyphMap;

type Account = {
  email: string;
  password: string;
  role: Role;
  name: string;
  verificationStatus: VerificationStatus;
  hasSchoolIdEvidence: boolean;
};

type PendingVerification = {
  purpose: VerificationPurpose;
  role: Role;
  name: string;
  email: string;
  code: string;
  expiresAt: number;
};

type Listing = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  kind: ListingKind;
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
  music: string;
  comments: string;
};

type ChatMessage = {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
};

type ChatThread = {
  id: string;
  name: string;
  subtitle: string;
  status: string;
  avatar: string;
  tag?: string;
  messages: ChatMessage[];
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
    kind: 'Skill',
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
    kind: 'Product',
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
    kind: 'Skill',
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
    title: 'Sneaker care kit',
    vendor: 'FreshStep Campus',
    category: 'Fashion',
    kind: 'Product',
    price: 'GHS 45',
    priceType: 'Fixed',
    rating: '4.6',
    campus: 'TF Hostel',
    description: 'A ready-to-use kit with cleaner, brush, lace whitener, and deodorizer for everyday campus sneakers.',
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
    music: 'Fangs (Slowed Down) · Dionnyuss',
    comments: '26',
    image:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'r2',
    vendor: 'Nia Design Co.',
    title: 'Sketch to launch-ready logo',
    views: '3.7K',
    caption: 'Turning a thrift brand idea into a clean campus identity.',
    music: 'Studio Beats · Nia',
    comments: '18',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'r3',
    vendor: 'Kobby Bakes',
    title: 'Packing a surprise cake box',
    views: '5.4K',
    caption: 'Small-batch treats for a hostel birthday surprise.',
    music: 'Afternoon Vibes · Campus Kitchen',
    comments: '12',
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
const demoVendorName = 'Ama Beauty Lab';

const activeOrders = [
  { id: 'o1', customer: 'Nana Y.', item: 'Soft glam and wig styling', amount: 'GHS 120', status: 'Due today' },
  { id: 'o2', customer: 'Akua M.', item: 'Weekend frontal touch-up', amount: 'GHS 90', status: 'Awaiting time' },
  { id: 'o3', customer: 'Esi B.', item: 'Hall dinner glam', amount: 'GHS 150', status: 'Confirmed' },
];

const vendorMessages = [
  { id: 'vm1', customer: 'Nana Y.', last: 'Can you still do 5pm today?', tag: 'Order' },
  { id: 'vm2', customer: 'Esi B.', last: 'I sent my inspiration photo.', tag: 'New brief' },
  { id: 'vm3', customer: 'Akua M.', last: 'Can we agree on GHS 90?', tag: 'Offer' },
];

const customerChatThreads: ChatThread[] = [
  {
    id: 'c1',
    name: 'Ama Beauty Lab',
    subtitle: 'Soft glam and wig styling',
    status: 'Online',
    avatar: 'A',
    messages: [
      { id: 'c1m1', from: 'them' as const, text: 'Hi Toni, I have a 5pm slot open today.', time: '2:12 PM' },
      { id: 'c1m2', from: 'me' as const, text: 'Perfect. Can you do GHS 100 if I come with my wig washed?', time: '2:14 PM' },
      { id: 'c1m3', from: 'them' as const, text: 'Yes, I can do GHS 100 if you book before Friday.', time: '2:16 PM' },
      { id: 'c1m4', from: 'me' as const, text: 'Deal. I will pass by Pentagon after class.', time: '2:18 PM' },
    ],
  },
  {
    id: 'c2',
    name: 'FreshStep Campus',
    subtitle: 'Sneaker care kit',
    status: 'Replies fast',
    avatar: 'F',
    messages: [
      { id: 'c2m1', from: 'them' as const, text: 'Send a photo of the sneakers and I will confirm timing.', time: '11:03 AM' },
      { id: 'c2m2', from: 'me' as const, text: 'Sending now. Can I pick up at TF Hostel?', time: '11:05 AM' },
    ],
  },
  {
    id: 'c3',
    name: 'Nia Design Co.',
    subtitle: 'Logo and brand kit',
    status: 'Active today',
    avatar: 'N',
    messages: [
      { id: 'c3m1', from: 'them' as const, text: 'The starter logo package includes two revisions.', time: '9:41 AM' },
      { id: 'c3m2', from: 'me' as const, text: 'Nice. I need a thrift brand logo before Sunday.', time: '9:44 AM' },
      { id: 'c3m3', from: 'them' as const, text: 'That timeline works. Send your color ideas and brand name.', time: '9:48 AM' },
    ],
  },
  {
    id: 'c4',
    name: 'Kobby Bakes',
    subtitle: 'Mini cake boxes',
    status: 'Taking preorders',
    avatar: 'K',
    messages: [
      { id: 'c4m1', from: 'them' as const, text: 'Cake boxes are available for Friday pickup.', time: '8:30 AM' },
      { id: 'c4m2', from: 'me' as const, text: 'Great. I may need one for a hostel birthday.', time: '8:42 AM' },
    ],
  },
];

const vendorChatThreads: ChatThread[] = [
  {
    id: 'vm-toni',
    name: 'Toni Customer',
    subtitle: 'Ama Beauty Lab purchase chat',
    status: 'Customer lead',
    avatar: 'T',
    tag: 'Lead',
    messages: [],
  },
  {
    id: 'vm1',
    name: 'Nana Y.',
    subtitle: 'Soft glam and wig styling',
    status: 'Order chat',
    avatar: 'N',
    tag: 'Order',
    messages: [
      { id: 'vm1m1', from: 'them' as const, text: 'Can you still do 5pm today?', time: '1:25 PM' },
      { id: 'vm1m2', from: 'me' as const, text: 'Yes, 5pm is open. Please come with your wig brushed out.', time: '1:27 PM' },
      { id: 'vm1m3', from: 'them' as const, text: 'Great, I will be at Pentagon by 4:55.', time: '1:29 PM' },
    ],
  },
  {
    id: 'vm2',
    name: 'Esi B.',
    subtitle: 'Hall dinner glam',
    status: 'New brief',
    avatar: 'E',
    tag: 'New brief',
    messages: [
      { id: 'vm2m1', from: 'them' as const, text: 'I sent my inspiration photo.', time: '12:10 PM' },
      { id: 'vm2m2', from: 'me' as const, text: 'Seen. I can recreate that with softer lashes for campus lighting.', time: '12:18 PM' },
    ],
  },
  {
    id: 'vm3',
    name: 'Akua M.',
    subtitle: 'Weekend frontal touch-up',
    status: 'Offer',
    avatar: 'A',
    tag: 'Offer',
    messages: [
      { id: 'vm3m1', from: 'them' as const, text: 'Can we agree on GHS 90?', time: '10:32 AM' },
      { id: 'vm3m2', from: 'me' as const, text: 'GHS 90 works if you can come Saturday morning.', time: '10:35 AM' },
    ],
  },
];

const tabConfig: Record<Tab, { icon: IconName; activeIcon: IconName }> = {
  Home: { icon: 'home-outline', activeIcon: 'home' },
  Dashboard: { icon: 'grid-outline', activeIcon: 'grid' },
  Products: { icon: 'pricetags-outline', activeIcon: 'pricetags' },
  Reels: { icon: 'play-circle-outline', activeIcon: 'play-circle' },
  Chats: { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  Saved: { icon: 'heart-outline', activeIcon: 'heart' },
  Studio: { icon: 'sparkles-outline', activeIcon: 'sparkles' },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>('signin');
  const [role, setRole] = useState<Role>('customer');
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts);
  const [authMessage, setAuthMessage] = useState('');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [vendorEvidenceAttached, setVendorEvidenceAttached] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNeed, setActiveNeed] = useState(quickNeeds[0]);
  const [likedReels, setLikedReels] = useState<string[]>(['r1']);
  const [subscribedVendors, setSubscribedVendors] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(['l2']);
  const [marketListings, setMarketListings] = useState<Listing[]>(listings);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0]);
  const [vendorPageListing, setVendorPageListing] = useState<Listing | null>(null);
  const [studioMode, setStudioMode] = useState<StudioMode>('menu');
  const [newListingKind, setNewListingKind] = useState<ListingKind>('Skill');
  const [newListingTitle, setNewListingTitle] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newListingImageUri, setNewListingImageUri] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [sentMessagesByThread, setSentMessagesByThread] = useState<Record<string, ChatMessage[]>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredListings = useMemo(() => {
    return marketListings.filter((listing) => {
      const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
      const matchesSearch =
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.vendor.toLowerCase().includes(search.toLowerCase()) ||
        listing.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, marketListings, search]);

  const vendorListings = useMemo(
    () => marketListings.filter((listing) => listing.vendor === demoVendorName),
    [marketListings],
  );
  const savedListings = marketListings.filter((listing) => savedIds.includes(listing.id));
  const chatThreads = role === 'vendor' ? vendorChatThreads : customerChatThreads;
  const selectedChat = selectedChatId ? chatThreads.find((thread) => thread.id === selectedChatId) ?? null : null;
  const selectedMessages = selectedChat
    ? [...selectedChat.messages, ...(sentMessagesByThread[selectedChat.id] ?? [])]
    : [];
  const vendorPageListings = vendorPageListing
    ? marketListings.filter((listing) => listing.vendor === vendorPageListing.vendor)
    : [];

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

  const toggleSubscribe = (vendor: string) => {
    setSubscribedVendors((current) =>
      current.includes(vendor) ? current.filter((item) => item !== vendor) : [...current, vendor],
    );
  };

  const shareReel = (reel: Reel) => {
    Alert.alert('Share reel', `Share ${reel.title} by ${reel.vendor} with friends.`);
  };

  const resetAuthForm = () => {
    setAuthMessage('');
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setVerificationCode('');
    setNewPassword('');
    setPendingVerification(null);
    setVendorEvidenceAttached(false);
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthFlow(mode === 'signup' ? 'signupEmail' : 'signin');
    resetAuthForm();
  };

  const openAuthFlow = (flow: AuthFlow) => {
    setAuthFlow(flow);
    setAuthMessage('');
    setVerificationCode('');
    setNewPassword('');
    if (flow === 'google' || flow === 'signin') {
      setAuthPassword('');
    }
    if (flow === 'forgotEmail' || flow === 'signupEmail' || flow === 'signin') {
      setPendingVerification(null);
      setVendorEvidenceAttached(false);
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const createVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendVerificationEmail = (email: string, code: string, purpose: VerificationPurpose) => {
    const title = purpose === 'forgot' ? 'Password reset code sent' : 'Signup code sent';
    Alert.alert(title, `A verification code was sent to ${email}. Demo email code: ${code}`);
  };

  const beginForgotPassword = () => {
    const normalizedEmail = authEmail.trim().toLowerCase();
    const account = accounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.role === role,
    );

    if (!isValidEmail(normalizedEmail)) {
      setAuthMessage('Enter the email you used to sign up.');
      return;
    }

    if (!account) {
      setAuthMessage('No account was found for this email and role.');
      return;
    }

    const code = createVerificationCode();
    setPendingVerification({
      purpose: 'forgot',
      role,
      name: account.name,
      email: normalizedEmail,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    sendVerificationEmail(normalizedEmail, code, 'forgot');
    setAuthMessage('');
    setAuthFlow('forgotCode');
  };

  const beginSignup = () => {
    const trimmedName = authName.trim();
    const normalizedEmail = authEmail.trim().toLowerCase();

    if (!trimmedName || !isValidEmail(normalizedEmail)) {
      setAuthMessage('Enter your name and a valid email address.');
      return;
    }

    if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail && account.role === role)) {
      setAuthMessage('An account already exists for this email and role.');
      return;
    }

    const code = createVerificationCode();
    setPendingVerification({
      purpose: 'signup',
      role,
      name: trimmedName,
      email: normalizedEmail,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    sendVerificationEmail(normalizedEmail, code, 'signup');
    setAuthMessage('');
    setAuthFlow('signupCode');
  };

  const verifyPendingCode = () => {
    if (!pendingVerification) {
      setAuthMessage('Start the process again so we can send a fresh code.');
      return;
    }

    if (Date.now() > pendingVerification.expiresAt) {
      setAuthMessage('That code expired. Send a new code to continue.');
      return;
    }

    if (verificationCode.trim() !== pendingVerification.code) {
      setAuthMessage('The code does not match the one sent to your email.');
      return;
    }

    setVerificationCode('');
    setAuthMessage('');
    setAuthFlow(pendingVerification.purpose === 'forgot' ? 'forgotPassword' : 'signupPassword');
  };

  const completePasswordStep = () => {
    if (!pendingVerification) {
      setAuthMessage('Start the process again so this password can be saved.');
      return;
    }

    if (newPassword.length < 6) {
      setAuthMessage('Choose a password with at least 6 characters.');
      return;
    }

    if (pendingVerification.purpose === 'forgot') {
      setAccounts((current) =>
        current.map((account) =>
          account.email.toLowerCase() === pendingVerification.email && account.role === pendingVerification.role
            ? { ...account, password: newPassword }
            : account,
        ),
      );
      setAuthEmail(pendingVerification.email);
      setAuthPassword('');
      setNewPassword('');
      setPendingVerification(null);
      setAuthFlow('signin');
      setAuthMessage('Password updated. Log in with your new password.');
      return;
    }

    if (pendingVerification.role === 'vendor' && !vendorEvidenceAttached) {
      setAuthMessage('Vendors must attach school ID evidence before the account can be submitted.');
      return;
    }

    setAccounts((current) => [
      ...current,
      {
        email: pendingVerification.email,
        password: newPassword,
        role: pendingVerification.role,
        name: pendingVerification.name,
        verificationStatus: pendingVerification.role === 'vendor' ? 'pending' : 'verified',
        hasSchoolIdEvidence: pendingVerification.role === 'vendor',
      },
    ]);
    setAuthEmail(pendingVerification.email);
    setAuthPassword('');
    setNewPassword('');
    setVendorEvidenceAttached(false);
    setPendingVerification(null);
    setAuthFlow('signin');
    setAuthMessage(
      pendingVerification.role === 'vendor'
        ? 'Account submitted for school ID review. Login opens after verification.'
        : 'Account created. Log in with your new password.',
    );
  };

  const openAddListingForm = (kind?: ListingKind) => {
    if (kind) {
      setNewListingKind(kind);
    }
    setStudioMode('addListing');
    setActiveTab('Studio');
  };

  const closeAddListingForm = () => {
    setStudioMode('menu');
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
    setActiveTab(account.role === 'vendor' ? 'Dashboard' : 'Home');
    setSelectedChatId(null);
    setMessageDraft('');
  };

  const handleGoogleContinue = () => {
    const trimmedName = authName.trim() || (role === 'customer' ? 'Google Customer' : 'Google Vendor');
    const normalizedEmail = authEmail.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setAuthMessage('Enter the email connected to your Google account.');
      return;
    }

    const existingAccount = accounts.find(
      (account) => account.email.toLowerCase() === normalizedEmail && account.role === role,
    );

    if (existingAccount?.role === 'vendor' && existingAccount.verificationStatus !== 'verified') {
      setAuthMessage('This vendor account is still waiting for school ID verification.');
      return;
    }

    if (!existingAccount && role === 'vendor' && !vendorEvidenceAttached) {
      setAuthMessage('Attach school ID evidence so the vendor account can be reviewed.');
      return;
    }

    if (!existingAccount) {
      setAccounts((current) => [
        ...current,
        {
          email: normalizedEmail,
          password: `google-${Date.now()}`,
          role,
          name: trimmedName,
          verificationStatus: role === 'vendor' ? 'pending' : 'verified',
          hasSchoolIdEvidence: role === 'vendor',
        },
      ]);
    }

    if (role === 'vendor' && !existingAccount) {
      setAuthFlow('signin');
      setAuthName('');
      setAuthEmail(normalizedEmail);
      setVendorEvidenceAttached(false);
      setAuthMessage('Google vendor profile submitted. Login opens after school ID verification.');
      Alert.alert('Verification needed', 'Your Google vendor profile is pending school ID review.');
      return;
    }

    setAuthMessage('');
    setIsAuthenticated(true);
    setActiveTab(role === 'vendor' ? 'Dashboard' : 'Home');
  };

  const pickListingImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Photo permission needed', 'Allow photo library access so your product or skill image can be uploaded.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setNewListingImageUri(result.assets[0].uri);
    }
  };

  const addVendorListing = () => {
    const trimmedTitle = newListingTitle.trim();
    const trimmedPrice = newListingPrice.trim();

    if (!trimmedTitle || !trimmedPrice) {
      Alert.alert('Add listing details', 'Enter a title and price before adding it to your catalog.');
      return;
    }

    const priceType: PriceType = newListingKind === 'Skill' ? 'Negotiable' : 'Fixed';
    const listing: Listing = {
      id: `vendor-${Date.now()}`,
      title: trimmedTitle,
      vendor: demoVendorName,
      category: newListingKind === 'Skill' ? 'Beauty' : 'Product',
      kind: newListingKind,
      price: trimmedPrice.toUpperCase().startsWith('GHS') ? trimmedPrice : `GHS ${trimmedPrice}`,
      priceType,
      rating: 'New',
      campus: 'Vendor Studio',
      description:
        newListingKind === 'Skill'
          ? 'A skill-based service from this student vendor. Customers can negotiate before booking.'
          : 'A product-based listing from this student vendor. Price is fixed for checkout.',
      image:
        newListingImageUri ||
        (newListingKind === 'Skill'
          ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80'
          : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80'),
      tint: newListingKind === 'Skill' ? '#a78bfa' : '#8b5cf6',
      tags: [newListingKind, priceType, 'Vendor added'],
    };

    setMarketListings((current) => [listing, ...current]);
    setSelectedListing(listing);
    setVendorPageListing(null);
    setNewListingTitle('');
    setNewListingPrice('');
    setNewListingImageUri('');
    setStudioMode('menu');
    setActiveTab('Products');
  };

  const openVendorListingPage = (listing: Listing) => {
    setVendorPageListing(listing);
    setActiveTab('Home');
  };

  const openListingChat = (listing: Listing, intent: 'purchase' | 'bargain') => {
    if (intent === 'bargain' && listing.priceType !== 'Negotiable') {
      Alert.alert('Fixed price', 'This listing is fixed price, so bargaining is not available.');
      return;
    }

    const thread = customerChatThreads.find((chat) => chat.name === listing.vendor);
    setSelectedChatId(thread?.id ?? 'c1');
    setMessageDraft(
      intent === 'purchase'
        ? `Hi ${listing.vendor}, I am interested in purchasing ${listing.title} for ${listing.price}. Is it still available?`
        : `Hi ${listing.vendor}, I am interested in ${listing.title}. It is listed at ${listing.price}. Can we bargain?`,
    );
    setActiveTab('Chats');
  };

  const openChatThread = (threadId: string) => {
    setSelectedChatId(threadId);
    setMessageDraft('');
  };

  const closeChatThread = () => {
    setSelectedChatId(null);
    setMessageDraft('');
  };

  const getLinkedThreadId = (threadId: string) => {
    if (role === 'customer') {
      const customerThread = customerChatThreads.find((thread) => thread.id === threadId);
      return customerThread?.name === 'Ama Beauty Lab' ? 'vm-toni' : null;
    }

    return threadId === 'vm-toni' ? 'c1' : null;
  };

  const getThreadMessages = (thread: ChatThread) => [
    ...thread.messages,
    ...(sentMessagesByThread[thread.id] ?? []),
  ];

  const sendMessage = () => {
    const trimmedMessage = messageDraft.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!selectedChat) {
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const nextMessage: ChatMessage = {
      id: `${selectedChat.id}-${now.getTime()}`,
      from: 'me',
      text: trimmedMessage,
      time,
    };
    const linkedThreadId = getLinkedThreadId(selectedChat.id);
    const linkedMessage: ChatMessage = {
      id: `${linkedThreadId ?? selectedChat.id}-${now.getTime()}`,
      from: 'them',
      text: trimmedMessage,
      time,
    };

    setSentMessagesByThread((current) => ({
      ...current,
      [selectedChat.id]: [...(current[selectedChat.id] ?? []), nextMessage],
      ...(linkedThreadId
        ? { [linkedThreadId]: [...(current[linkedThreadId] ?? []), linkedMessage] }
        : {}),
    }));
    setMessageDraft('');
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
            <Text style={styles.authTitle}>
              {authFlow === 'signin'
                ? 'Welcome Back!'
                : authFlow.startsWith('signup')
                  ? 'Create Account'
                  : authFlow === 'google'
                    ? 'Continue with Google'
                    : 'Reset Password'}
            </Text>
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

          {authFlow === 'signin' && (
            <View style={styles.authPanel}>
              <Pressable style={styles.googleButton} onPress={() => openAuthFlow('google')}>
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
              <Pressable onPress={() => openAuthFlow('forgotEmail')}>
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

          {authFlow === 'signupEmail' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="person-add-outline" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Start your Stumart profile</Text>
                  <Text style={styles.flowCopy}>Enter your name and email. The next page verifies your inbox.</Text>
                </View>
              </View>

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

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={beginSignup}>
                <Text style={styles.authSubmitText}>Next</Text>
              </Pressable>
              <Pressable onPress={() => switchAuthMode('signin')}>
                <Text style={styles.authSwitchText}>Already have an account? Log in</Text>
              </Pressable>
            </View>
          )}

          {authFlow === 'signupCode' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="mail-unread-outline" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Check your email</Text>
                  <Text style={styles.flowCopy}>
                    We sent a 6-digit signup code to {pendingVerification?.email ?? 'your email'}.
                  </Text>
                </View>
              </View>

              <Text style={styles.formLabel}>Verification code</Text>
              <TextInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9f8fb8"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.underlinedInput}
              />

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={verifyPendingCode}>
                <Text style={styles.authSubmitText}>Verify Code</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (pendingVerification) {
                    sendVerificationEmail(
                      pendingVerification.email,
                      pendingVerification.code,
                      pendingVerification.purpose,
                    );
                  }
                }}
              >
                <Text style={styles.authSwitchText}>Resend code</Text>
              </Pressable>
              <Pressable onPress={() => openAuthFlow('signupEmail')}>
                <Text style={styles.authSwitchText}>Use a different email</Text>
              </Pressable>
            </View>
          )}

          {authFlow === 'signupPassword' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="lock-closed-outline" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Create your password</Text>
                  <Text style={styles.flowCopy}>
                    This saves your account so you can return to login with this email.
                  </Text>
                </View>
              </View>

              <Text style={styles.formLabel}>New password</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9f8fb8"
                secureTextEntry
                style={styles.underlinedInput}
              />

              {pendingVerification?.role === 'vendor' && (
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

              {pendingVerification?.role === 'vendor' && (
                <View style={styles.verificationNote}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#7c3aed" />
                  <Text style={styles.verificationText}>
                    Vendor login stays locked until the ID evidence is reviewed and verified.
                  </Text>
                </View>
              )}

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={completePasswordStep}>
                <Text style={styles.authSubmitText}>Save Account</Text>
              </Pressable>
              <Pressable onPress={() => openAuthFlow('signin')}>
                <Text style={styles.authSwitchText}>Back to login</Text>
              </Pressable>
            </View>
          )}

          {authFlow === 'google' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="logo-google" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Finish secure sign in</Text>
                  <Text style={styles.flowCopy}>
                    Confirm the campus profile that should be linked to Google for this role.
                  </Text>
                </View>
              </View>

              <Text style={styles.formLabel}>Full name</Text>
              <TextInput
                value={authName}
                onChangeText={setAuthName}
                placeholder={role === 'vendor' ? 'Vendor or brand owner name' : 'Your name'}
                placeholderTextColor="#9f8fb8"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Google email</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder={role === 'vendor' ? 'vendor@gmail.com' : 'student@gmail.com'}
                placeholderTextColor="#9f8fb8"
                autoCapitalize="none"
                keyboardType="email-address"
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
                    name={vendorEvidenceAttached ? 'checkmark-circle' : 'id-card-outline'}
                    size={20}
                    color={vendorEvidenceAttached ? '#ffffff' : '#7c3aed'}
                  />
                  <Text style={[styles.evidenceText, vendorEvidenceAttached && styles.evidenceTextReady]}>
                    {vendorEvidenceAttached ? 'School ID ready for review' : 'Add school ID evidence'}
                  </Text>
                </Pressable>
              )}

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={handleGoogleContinue}>
                <Text style={styles.authSubmitText}>Continue</Text>
              </Pressable>
              <Pressable onPress={() => openAuthFlow('signin')}>
                <Text style={styles.authSwitchText}>Back to email login</Text>
              </Pressable>
            </View>
          )}

          {authFlow === 'forgotEmail' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="key-outline" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Recover your account</Text>
                  <Text style={styles.flowCopy}>
                    Enter the email you used to sign up. We will send a reset code next.
                  </Text>
                </View>
              </View>

              <Text style={styles.formLabel}>Account email</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder={role === 'vendor' ? 'vendor@stumart.app' : 'customer@stumart.app'}
                placeholderTextColor="#9f8fb8"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.underlinedInput}
              />

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={beginForgotPassword}>
                <Text style={styles.authSubmitText}>Next</Text>
              </Pressable>
              <Pressable onPress={() => openAuthFlow('signin')}>
                <Text style={styles.authSwitchText}>Back to login</Text>
              </Pressable>
            </View>
          )}

          {authFlow === 'forgotCode' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="mail-open-outline" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Enter reset code</Text>
                  <Text style={styles.flowCopy}>
                    Check {pendingVerification?.email ?? 'your email'} for the 6-digit reset code.
                  </Text>
                </View>
              </View>

              <Text style={styles.formLabel}>Recovery code</Text>
              <TextInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9f8fb8"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.underlinedInput}
              />

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={verifyPendingCode}>
                <Text style={styles.authSubmitText}>Verify Code</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (pendingVerification) {
                    sendVerificationEmail(
                      pendingVerification.email,
                      pendingVerification.code,
                      pendingVerification.purpose,
                    );
                  }
                }}
              >
                <Text style={styles.authSwitchText}>Resend code</Text>
              </Pressable>
              <Pressable onPress={() => openAuthFlow('forgotEmail')}>
                <Text style={styles.authSwitchText}>Use a different email</Text>
              </Pressable>
            </View>
          )}

          {authFlow === 'forgotPassword' && (
            <View style={styles.authPanel}>
              <View style={styles.flowHeader}>
                <View style={styles.flowIconWrap}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#7c3aed" />
                </View>
                <View style={styles.flowHeaderText}>
                  <Text style={styles.flowTitle}>Set a new password</Text>
                  <Text style={styles.flowCopy}>Your account is verified. Save a new password and return to login.</Text>
                </View>
              </View>

              <Text style={styles.formLabel}>New password</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9f8fb8"
                secureTextEntry
                style={styles.underlinedInput}
              />

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}

              <Pressable style={styles.authSubmitButton} onPress={completePasswordStep}>
                <Text style={styles.authSubmitText}>Update Password</Text>
              </Pressable>
              <Pressable onPress={() => openAuthFlow('signin')}>
                <Text style={styles.authSwitchText}>Back to login</Text>
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
                <Text style={styles.appTitle}>{role === 'vendor' ? 'Ama Beauty Lab' : 'Stumart'}</Text>
              </View>
            </View>
            <Pressable
              style={styles.profilePill}
              onPress={() => {
                setIsAuthenticated(false);
                setSelectedChatId(null);
                setMessageDraft('');
              }}
            >
              <Text style={styles.profileInitial}>{role === 'customer' ? 'C' : 'V'}</Text>
            </Pressable>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#7c3aed" />
            <Text style={styles.locationText}>KNUST • Oforikrom</Text>
          </View>
          <Text style={styles.heroLine}>
            {role === 'vendor'
              ? 'Today at the studio'
              : 'What do you need before your next class break?'}
          </Text>
          {role === 'customer' ? (
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
          ) : (
            <View style={styles.vendorHeroStats}>
              <View style={styles.vendorHeroStat}>
                <Text style={styles.vendorHeroValue}>GHS 1,240</Text>
                <Text style={styles.vendorHeroLabel}>Cash made</Text>
              </View>
              <View style={styles.vendorHeroStat}>
                <Text style={styles.vendorHeroValue}>{activeOrders.length}</Text>
                <Text style={styles.vendorHeroLabel}>Active orders</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {role === 'vendor' && activeTab === 'Dashboard' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Business dashboard</Text>
              <Text style={styles.sectionMeta}>Today</Text>
            </View>

            <LinearGradient colors={['#251044', '#7c3aed']} style={styles.vendorRevenueCard}>
              <View>
                <Text style={styles.revenueLabel}>Today's cash made</Text>
                <Text style={styles.revenueValue}>GHS 1,240</Text>
                <Text style={styles.revenueMeta}>+18% from yesterday</Text>
              </View>
              <View style={styles.revenueIcon}>
                <Ionicons name="trending-up" size={28} color="#ffffff" />
              </View>
            </LinearGradient>

            <View style={styles.vendorMetricRow}>
              <View style={styles.vendorMetricCard}>
                <View style={styles.metricIconWrap}>
                  <Ionicons name="receipt-outline" size={20} color="#0f766e" />
                </View>
                <Text style={styles.metricValue}>{activeOrders.length}</Text>
                <Text style={styles.metricLabel}>Active orders</Text>
              </View>
              <View style={styles.vendorMetricCard}>
                <View style={[styles.metricIconWrap, styles.metricIconPurple]}>
                  <Ionicons name="chatbubbles-outline" size={20} color="#7c3aed" />
                </View>
                <Text style={styles.metricValue}>{vendorMessages.length}</Text>
                <Text style={styles.metricLabel}>Unread chats</Text>
              </View>
              <View style={styles.vendorMetricCard}>
                <View style={[styles.metricIconWrap, styles.metricIconAmber]}>
                  <Ionicons name="storefront-outline" size={20} color="#b45309" />
                </View>
                <Text style={styles.metricValue}>{vendorListings.length}</Text>
                <Text style={styles.metricLabel}>Live listings</Text>
              </View>
            </View>

            <View style={styles.vendorActionGrid}>
              {[
                { label: 'Reply to clients', icon: 'chatbubble-ellipses-outline' as IconName, action: () => {
                  closeChatThread();
                  setActiveTab('Chats');
                } },
                { label: 'Add listing', icon: 'add-circle-outline' as IconName, action: () => openAddListingForm() },
                { label: 'View catalog', icon: 'pricetags-outline' as IconName, action: () => setActiveTab('Products') },
                { label: 'Post reel', icon: 'play-circle-outline' as IconName, action: () => setActiveTab('Reels') },
              ].map((item) => (
                <Pressable key={item.label} style={styles.vendorActionCard} onPress={item.action}>
                  <Ionicons name={item.icon} size={21} color="#7c3aed" />
                  <Text style={styles.vendorActionText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active orders</Text>
              <Text style={styles.sectionMeta}>Manage</Text>
            </View>
            {activeOrders.map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <View style={styles.orderIcon}>
                  <Ionicons name="bag-check-outline" size={20} color="#7c3aed" />
                </View>
                <View style={styles.chatBody}>
                  <Text style={styles.chatName}>{order.customer}</Text>
                  <Text style={styles.chatLast}>{order.item}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>{order.amount}</Text>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                </View>
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Client messages</Text>
              <Text style={styles.sectionMeta}>Latest</Text>
            </View>
            {vendorChatThreads.map((message) => {
              const threadMessages = getThreadMessages(message);
              const lastMessage = threadMessages[threadMessages.length - 1];
              return (
                <Pressable
                  key={message.id}
                  style={styles.chatRow}
                  onPress={() => {
                    setSelectedChatId(message.id);
                    setActiveTab('Chats');
                  }}
                >
                  <LinearGradient colors={['#c084fc', '#8b5cf6']} style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>{message.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.chatBody}>
                    <Text style={styles.chatName}>{message.name}</Text>
                    <Text style={styles.chatLast}>{lastMessage?.text ?? message.subtitle}</Text>
                  </View>
                  <View style={styles.messageTag}>
                    <Text style={styles.messageTagText}>{message.tag}</Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}

        {role === 'vendor' && activeTab === 'Products' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your catalog</Text>
              <Pressable style={styles.catalogAddButton} onPress={() => openAddListingForm('Product')}>
                <Ionicons name="add-circle" size={17} color="#ffffff" />
                <Text style={styles.catalogAddButtonText}>Add product</Text>
              </Pressable>
            </View>
            <Text style={styles.catalogMeta}>{vendorListings.length} live products and skills</Text>
            <View style={styles.ruleBox}>
              <Ionicons name="information-circle-outline" size={20} color="#7c3aed" />
              <Text style={styles.ruleText}>
                Skills use negotiable pricing. Products use fixed pricing. Choose the listing type in Studio.
              </Text>
            </View>
            {vendorListings.map((listing) => (
              <View key={listing.id} style={styles.vendorProductCard}>
                <View style={styles.vendorProductTop}>
                  <Image source={{ uri: listing.image }} style={styles.vendorProductThumb} />
                  <View style={styles.flex}>
                    <Text style={styles.listingTitle}>{listing.title}</Text>
                    <Text style={styles.vendorName}>{listing.kind} based listing</Text>
                  </View>
                  <Text style={styles.vendorProductPrice}>{listing.price}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{listing.kind}</Text>
                  <Text style={styles.metaText}>{listing.priceType}</Text>
                  <Text style={styles.metaText}>Live</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'Home' && (
          vendorPageListing ? (
            <>
              <Pressable style={styles.backButton} onPress={() => setVendorPageListing(null)}>
                <Ionicons name="chevron-back" size={19} color="#7c3aed" />
                <Text style={styles.backButtonText}>Back to dashboard</Text>
              </Pressable>

              <ImageBackground
                source={{ uri: vendorPageListing.image }}
                imageStyle={styles.vendorPageImage}
                style={styles.vendorPageHero}
              >
                <LinearGradient colors={['rgba(37, 16, 68, 0.1)', 'rgba(37, 16, 68, 0.88)']} style={styles.vendorPageShade}>
                  <View style={styles.vendorPageBadge}>
                    <Ionicons name="storefront" size={15} color="#7c3aed" />
                    <Text style={styles.vendorPageBadgeText}>{vendorPageListings.length} listing</Text>
                  </View>
                  <Text style={styles.vendorPageTitle}>{vendorPageListing.vendor}</Text>
                  <Text style={styles.vendorPageCopy}>{vendorPageListing.campus}</Text>
                </LinearGradient>
              </ImageBackground>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Products and services</Text>
                <Text style={styles.sectionMeta}>Tap an action</Text>
              </View>

              {vendorPageListings.map((listing) => {
                const canBargain = listing.priceType === 'Negotiable';
                return (
                  <View key={listing.id} style={styles.vendorListingCard}>
                    <View style={styles.vendorListingTop}>
                      <View style={[styles.vendorProductIcon, { backgroundColor: `${listing.tint}22` }]}>
                        <Ionicons
                          name={listing.kind === 'Skill' ? 'sparkles-outline' : 'cube-outline'}
                          size={22}
                          color="#7c3aed"
                        />
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.listingTitle}>{listing.title}</Text>
                        <Text style={styles.vendorName}>{listing.kind}</Text>
                      </View>
                      <Text style={styles.vendorProductPrice}>{listing.price}</Text>
                    </View>
                    <Text style={styles.vendorListingDescription}>{listing.description}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{listing.priceType}</Text>
                      <Text style={styles.metaText}>{listing.category}</Text>
                      <Text style={styles.metaText}>{listing.rating}</Text>
                    </View>
                    <View style={styles.vendorListingActions}>
                      <Pressable style={styles.purchaseButton} onPress={() => openListingChat(listing, 'purchase')}>
                        <Ionicons name="bag-check" size={17} color="#ffffff" />
                        <Text style={styles.purchaseButtonText}>Purchase</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.bargainButton, !canBargain && styles.bargainButtonDisabled]}
                        onPress={() => openListingChat(listing, 'bargain')}
                      >
                        <Ionicons name="pricetag" size={17} color={canBargain ? '#7c3aed' : '#9f8fb8'} />
                        <Text style={[styles.bargainButtonText, !canBargain && styles.bargainButtonTextDisabled]}>
                          Bargain
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
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
              <Text style={styles.sectionTitle}>Most ordered</Text>
              <Text style={styles.sectionMeta}>Campus favorites</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mostOrderedRow}>
              {filteredListings.slice(0, 3).map((listing) => (
                <View key={listing.id} style={styles.mostOrderedCard}>
                  <Image source={{ uri: listing.image }} style={styles.mostOrderedImage} />
                  <View style={styles.mostOrderedBody}>
                    <Text style={styles.mostOrderedRating}>★ {listing.rating}</Text>
                    <Text style={styles.mostOrderedTitle} numberOfLines={1}>{listing.title}</Text>
                    <Text style={styles.mostOrderedVendor}>{listing.vendor}</Text>
                  </View>
                  <View style={styles.addPill}>
                    <Ionicons name="add" size={14} color="#ffffff" />
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.promoBannerContainer}>
              <ImageBackground
                source={{ uri: filteredListings[1]?.image }}
                imageStyle={styles.promoBannerImageStyle}
                style={styles.promoBanner}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(37, 16, 68, 0.85)']}
                  style={styles.promoBannerShade}
                >
                  <Text style={styles.promoTitle}>The best check check fried rice in Oforikrom?</Text>
                  <Text style={styles.promoCopy}>Served only at Check Check Brothers</Text>
                  <Pressable style={styles.promoButton}>
                    <Text style={styles.promoButtonText}>Get yours</Text>
                  </Pressable>
                </LinearGradient>
              </ImageBackground>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's for lunch</Text>
              <Text style={styles.sectionMeta}>Fresh campus picks</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.whatsForLunchRow}>
              {filteredListings.slice(0, 3).map((listing) => (
                <Pressable
                  key={listing.id}
                  onPress={() => openVendorListingPage(listing)}
                  style={styles.lunchCard}
                >
                  <Image source={{ uri: listing.image }} style={styles.lunchImage} />
                  <View style={styles.lunchInfo}>
                    <Text style={styles.lunchTitle} numberOfLines={1}>{listing.title}</Text>
                    <Text style={styles.lunchVendor}>{listing.vendor}</Text>
                    <Text style={styles.lunchPrice}>{listing.price}</Text>
                  </View>
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
                onOpen={() => openVendorListingPage(listing)}
              />
            ))}

            {selectedListing && (
              <LinearGradient colors={['#8b5cf6', '#c084fc']} style={styles.detailPanel}>
                <Text style={styles.detailPanelTitle}>{selectedListing.title}</Text>
                <Text style={styles.detailVendor}>{selectedListing.vendor}</Text>
                <Text style={styles.detailPanelCopy}>{selectedListing.description}</Text>
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.darkButton}
                    onPress={() => {
                      const thread = customerChatThreads.find((chat) => chat.name === selectedListing.vendor);
                      setSelectedChatId(thread?.id ?? 'c1');
                      setMessageDraft(
                        `Hi ${selectedListing.vendor}, I am interested in purchasing ${selectedListing.title} for ${selectedListing.price}. Is it still available?`,
                      );
                      setActiveTab('Chats');
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={17} color="#ffffff" />
                    <Text style={styles.darkButtonText}>Message</Text>
                  </Pressable>
                  {selectedListing.priceType === 'Negotiable' && (
                    <Pressable
                      style={styles.lightButton}
                      onPress={() => {
                        const thread = customerChatThreads.find((chat) => chat.name === selectedListing.vendor);
                        setSelectedChatId(thread?.id ?? 'c1');
                        setMessageDraft(
                          `Hi ${selectedListing.vendor}, I am interested in ${selectedListing.title}. It is listed at ${selectedListing.price}. Can we bargain?`,
                        );
                        setActiveTab('Chats');
                      }}
                    >
                      <Ionicons name="pricetag" size={17} color="#7c3aed" />
                      <Text style={styles.lightButtonText}>Bargain</Text>
                    </Pressable>
                  )}
                </View>
              </LinearGradient>
            )}
          </>
          )
        )}

        {activeTab === 'Reels' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Campus reels</Text>
              <Text style={styles.sectionMeta}>Vendor ads to bookmark</Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.reelFeed}
            >
              {reels.map((reel) => (
                <ImageBackground
                  key={reel.id}
                  source={{ uri: reel.image }}
                  imageStyle={styles.reelImage}
                  style={styles.reelCard}
                >
                  <LinearGradient colors={['transparent', 'rgba(37, 16, 68, 0.92)']} style={styles.reelOverlay}>
                    <View style={styles.reelTopRow}>
                      <Text style={styles.reelBadge}>{reel.views} views</Text>
                      <View style={styles.reelActionStrip}>
                        <Pressable style={styles.reelIconButton} onPress={() => toggleReelLike(reel.id)}>
                          <Ionicons
                            name={likedReels.includes(reel.id) ? 'heart' : 'heart-outline'}
                            size={24}
                            color={likedReels.includes(reel.id) ? '#f0abfc' : '#ffffff'}
                          />
                        </Pressable>
                        <Pressable style={styles.reelIconButton} onPress={() => shareReel(reel)}>
                          <Ionicons name="share-social-outline" size={24} color="#ffffff" />
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.reelVendorRow}>
                      <Text style={styles.reelVendorHandle}>@{reel.vendor}</Text>
                      <Pressable
                        style={[
                          styles.subscribeButton,
                          subscribedVendors.includes(reel.vendor) && styles.subscribeButtonActive,
                        ]}
                        onPress={() => toggleSubscribe(reel.vendor)}
                      >
                        <Text
                          style={[
                            styles.subscribeButtonText,
                            subscribedVendors.includes(reel.vendor) && styles.subscribeButtonTextActive,
                          ]}
                        >
                          {subscribedVendors.includes(reel.vendor) ? 'Following' : 'Subscribe'}
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={styles.reelTitle}>{reel.title}</Text>
                    <Text style={styles.reelCaption}>{reel.caption}</Text>
                    <View style={styles.reelBottomRow}>
                      <Text style={styles.reelMusicText}>🎵 {reel.music}</Text>
                      <Text style={styles.reelCommentText}>{reel.comments} comments</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              ))}
            </ScrollView>
          </>
        )}

        {activeTab === 'Chats' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{role === 'vendor' ? 'Client messages' : 'Campus chats'}</Text>
              <Text style={styles.sectionMeta}>{selectedChat ? 'Private chat' : `${chatThreads.length} contacts`}</Text>
            </View>

            {!selectedChat ? (
              <>
                <View style={styles.chatPrivacyNotice}>
                  <Ionicons name="lock-closed-outline" size={19} color="#7c3aed" />
                  <Text style={styles.chatPrivacyText}>
                    Select a contact to open a private conversation.
                  </Text>
                </View>

                {chatThreads.map((thread) => {
                  const threadMessages = getThreadMessages(thread);
                  const lastMessage = threadMessages[threadMessages.length - 1];
                  return (
                    <Pressable key={thread.id} style={styles.chatRow} onPress={() => openChatThread(thread.id)}>
                      <LinearGradient colors={['#c084fc', '#8b5cf6']} style={styles.chatAvatar}>
                        <Text style={styles.chatAvatarText}>{thread.avatar}</Text>
                      </LinearGradient>
                      <View style={styles.chatBody}>
                        <Text style={styles.chatName}>{thread.name}</Text>
                        <Text style={styles.chatLast}>{lastMessage?.text ?? thread.subtitle}</Text>
                      </View>
                      <View style={styles.messageTag}>
                        <Text style={styles.messageTagText}>{thread.tag ?? thread.status}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </>
            ) : (
              <View style={styles.chatPanel}>
                <View style={styles.chatPanelHeader}>
                  <Pressable style={styles.chatHeaderIcon} onPress={closeChatThread}>
                    <Ionicons name="chevron-back" size={20} color="#7c3aed" />
                  </Pressable>
                  <LinearGradient colors={['#c084fc', '#8b5cf6']} style={styles.chatPanelAvatar}>
                    <Text style={styles.chatAvatarText}>{selectedChat.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.chatPanelTitleWrap}>
                    <Text style={styles.chatPanelName}>{selectedChat.name}</Text>
                    <Text style={styles.chatPanelSubtitle}>{selectedChat.subtitle}</Text>
                  </View>
                  <Pressable style={styles.chatHeaderIcon}>
                    <Ionicons name="call-outline" size={20} color="#7c3aed" />
                  </Pressable>
                </View>

                <View style={styles.messageList}>
                  <Text style={styles.dayPill}>Today</Text>
                  {selectedMessages.map((message) => {
                    const mine = message.from === 'me';
                    return (
                      <View key={message.id} style={[styles.messageRow, mine && styles.messageRowMine]}>
                        <View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleTheirs]}>
                          <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.text}</Text>
                          <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{message.time}</Text>
                        </View>
                      </View>
                    );
                  })}
                  {selectedMessages.length === 0 && (
                    <View style={styles.emptyChatState}>
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#a78bfa" />
                      <Text style={styles.emptyTitle}>No messages yet</Text>
                      <Text style={styles.emptyCopy}>Start the conversation when you are ready.</Text>
                    </View>
                  )}
                </View>

                <View style={styles.composerRow}>
                  <Pressable style={styles.composerIcon}>
                    <Ionicons name="add" size={21} color="#7c3aed" />
                  </Pressable>
                  <TextInput
                    value={messageDraft}
                    onChangeText={setMessageDraft}
                    placeholder={role === 'vendor' ? 'Reply to customer' : 'Message vendor'}
                    placeholderTextColor="#9f8fb8"
                    multiline
                    style={styles.composerInput}
                  />
                  <Pressable
                    style={[styles.sendButton, !messageDraft.trim() && styles.sendButtonMuted]}
                    onPress={sendMessage}
                  >
                    <Ionicons name="send" size={18} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
            )}
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
                onOpen={() => openVendorListingPage(listing)}
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
              <Text style={styles.sectionMeta}>{studioMode === 'addListing' ? 'New listing' : 'Add and manage'}</Text>
            </View>

            {studioMode === 'menu' ? (
              <>
                <LinearGradient colors={['#8b5cf6', '#c084fc']} style={styles.studioHero}>
                  <Image source={logo} style={styles.studioLogo} resizeMode="contain" />
                  <Text style={styles.studioTitle}>Build the front of your campus business.</Text>
                  <Text style={styles.studioCopy}>
                    Add products or skills, post reels, reply to customers, and keep your listings ready for orders.
                  </Text>
                </LinearGradient>

                {[
                  { title: 'Add product or skill', icon: 'add-circle-outline' as IconName, action: () => openAddListingForm() },
                  { title: 'Upload reel', icon: 'cloud-upload-outline' as IconName, action: () => setActiveTab('Reels') },
                  { title: 'View products and skills', icon: 'pricetags-outline' as IconName, action: () => setActiveTab('Products') },
                  { title: 'Review orders and offers', icon: 'receipt-outline' as IconName, action: () => setActiveTab('Dashboard') },
                ].map((item) => (
                  <Pressable key={item.title} style={styles.studioAction} onPress={item.action}>
                    <View style={styles.studioActionLeft}>
                      <Ionicons name={item.icon} size={22} color="#7c3aed" />
                      <Text style={styles.studioActionText}>{item.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#a78bfa" />
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <Pressable style={styles.backButton} onPress={closeAddListingForm}>
                  <Ionicons name="chevron-back" size={19} color="#7c3aed" />
                  <Text style={styles.backButtonText}>Back to studio</Text>
                </Pressable>

                <View style={styles.addListingPanel}>
                  <Text style={styles.detailTitle}>Add a product or skill</Text>
                  <Text style={styles.detailCopy}>
                    Choose Product for fixed pricing or Skill for negotiable pricing.
                  </Text>
                  <View style={styles.kindSwitch}>
                    {(['Skill', 'Product'] as ListingKind[]).map((kind) => (
                      <Pressable
                        key={kind}
                        onPress={() => setNewListingKind(kind)}
                        style={[styles.kindButton, newListingKind === kind && styles.kindButtonActive]}
                      >
                        <Ionicons
                          name={kind === 'Skill' ? 'sparkles-outline' : 'cube-outline'}
                          size={18}
                          color={newListingKind === kind ? '#ffffff' : '#7c3aed'}
                        />
                        <Text style={[styles.kindButtonText, newListingKind === kind && styles.kindButtonTextActive]}>
                          {kind}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.ruleBox}>
                    <Ionicons name="pricetag-outline" size={18} color="#7c3aed" />
                    <Text style={styles.ruleText}>
                      {newListingKind === 'Skill'
                        ? 'This will be saved as Negotiable because it is a skill-based service.'
                        : 'This will be saved as Fixed because it is a product-based listing.'}
                    </Text>
                  </View>
                  <Pressable style={styles.photoUploadBox} onPress={pickListingImage}>
                    {newListingImageUri ? (
                      <Image source={{ uri: newListingImageUri }} style={styles.photoPreview} />
                    ) : (
                      <View style={styles.photoUploadEmpty}>
                        <Ionicons name="image-outline" size={28} color="#7c3aed" />
                        <Text style={styles.photoUploadTitle}>Upload listing photo</Text>
                        <Text style={styles.photoUploadCopy}>Use a clear image of the product or finished service.</Text>
                      </View>
                    )}
                    {newListingImageUri && (
                      <View style={styles.photoReplaceBadge}>
                        <Ionicons name="camera-outline" size={15} color="#ffffff" />
                        <Text style={styles.photoReplaceText}>Replace photo</Text>
                      </View>
                    )}
                  </Pressable>
                  <TextInput
                    value={newListingTitle}
                    onChangeText={setNewListingTitle}
                    placeholder={newListingKind === 'Skill' ? 'e.g. Wig installation' : 'e.g. Hair care kit'}
                    placeholderTextColor="#9f8fb8"
                    style={styles.input}
                  />
                  <TextInput
                    value={newListingPrice}
                    onChangeText={setNewListingPrice}
                    placeholder="Price, e.g. GHS 120"
                    placeholderTextColor="#9f8fb8"
                    keyboardType="default"
                    style={styles.input}
                  />
                  <Pressable style={styles.primaryButton} onPress={addVendorListing}>
                    <Text style={styles.primaryButtonText}>Add to catalog</Text>
                    <Ionicons name="add-circle" size={18} color="#ffffff" />
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {(role === 'vendor'
          ? (['Dashboard', 'Products', 'Reels', 'Chats', 'Studio'] as Tab[])
          : (['Home', 'Reels', 'Chats', 'Saved'] as Tab[])
        ).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => {
                if (tab === 'Chats') {
                  closeChatThread();
                } else {
                  setMessageDraft('');
                }

                if (tab !== 'Home') {
                  setVendorPageListing(null);
                }

                setActiveTab(tab);
              }}
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
          <Text style={styles.metaText}>{listing.kind}</Text>
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
    borderRadius: 8,
    padding: 22,
    gap: 11,
    borderWidth: 1,
    borderColor: '#eadcff',
    shadowColor: '#4c1d95',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
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
    borderRadius: 8,
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
  flowHeader: {
    backgroundColor: '#fbf8ff',
    borderWidth: 1,
    borderColor: '#eadcff',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  flowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowHeaderText: {
    flex: 1,
  },
  flowTitle: {
    color: '#251044',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 3,
  },
  flowCopy: {
    color: '#6f5d8d',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  locationText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '900',
  },
  quickActionRow: {
    marginTop: 14,
  },
  quickActionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionButtonText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  vendorHeroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  mostOrderedRow: {
    marginBottom: 16,
  },
  mostOrderedCard: {
    width: 188,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  mostOrderedImage: {
    width: '100%',
    height: 120,
  },
  mostOrderedBody: {
    padding: 12,
  },
  mostOrderedRating: {
    color: '#7c3aed',
    fontWeight: '900',
    marginBottom: 6,
  },
  mostOrderedTitle: {
    color: '#251044',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  mostOrderedVendor: {
    color: '#7f6a9f',
    fontSize: 12,
    fontWeight: '800',
  },
  addPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoBannerContainer: {
    marginBottom: 18,
  },
  promoBanner: {
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 170,
    justifyContent: 'flex-end',
  },
  promoBannerImageStyle: {
    borderRadius: 28,
  },
  promoBannerShade: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  promoCopy: {
    color: '#f5edff',
    fontWeight: '800',
    marginBottom: 14,
  },
  promoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  whatsForLunchRow: {
    marginBottom: 16,
  },
  lunchCard: {
    width: 170,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eadcff',
    overflow: 'hidden',
  },
  lunchImage: {
    width: '100%',
    height: 110,
  },
  lunchInfo: {
    padding: 12,
  },
  lunchTitle: {
    color: '#251044',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  lunchVendor: {
    color: '#7f6a9f',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  lunchPrice: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  vendorHeroStat: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  vendorHeroValue: {
    color: '#251044',
    fontSize: 18,
    fontWeight: '900',
  },
  vendorHeroLabel: {
    color: '#7f6a9f',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 3,
  },
  vendorRevenueCard: {
    borderRadius: 26,
    padding: 18,
    marginBottom: 12,
    minHeight: 134,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueLabel: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  revenueValue: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '900',
    marginTop: 8,
  },
  revenueMeta: {
    color: '#f5edff',
    fontWeight: '800',
    marginTop: 7,
  },
  revenueIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorMetricRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 12,
  },
  vendorMetricCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconPurple: {
    backgroundColor: '#f3e8ff',
  },
  metricIconAmber: {
    backgroundColor: '#fef3c7',
  },
  metricValue: {
    color: '#251044',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  metricLabel: {
    color: '#7f6a9f',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  vendorActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  vendorActionCard: {
    width: '48%',
    minHeight: 70,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eadcff',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  vendorActionText: {
    flex: 1,
    color: '#251044',
    fontWeight: '900',
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  statValue: {
    color: '#251044',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  statLabel: {
    color: '#7f6a9f',
    fontWeight: '800',
    marginTop: 3,
  },
  orderRow: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eadcff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    color: '#251044',
    fontWeight: '900',
  },
  orderStatus: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  messageTag: {
    backgroundColor: '#f3e8ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  messageTagText: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '900',
  },
  ruleBox: {
    backgroundColor: '#f5edff',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#eadcff',
    marginBottom: 12,
  },
  ruleText: {
    flex: 1,
    color: '#6f5d8d',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  catalogAddButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catalogAddButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  catalogMeta: {
    color: '#8b7aa8',
    fontWeight: '800',
    marginTop: -6,
    marginBottom: 12,
  },
  vendorProductCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  vendorProductTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorProductIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorProductThumb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f3e8ff',
  },
  vendorProductPrice: {
    color: '#7c3aed',
    fontWeight: '900',
    flexShrink: 0,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#eadcff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  backButtonText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  vendorPageHero: {
    minHeight: 220,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#4c1d95',
    marginBottom: 16,
  },
  vendorPageImage: {
    borderRadius: 28,
  },
  vendorPageShade: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  vendorPageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  vendorPageBadgeText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '900',
  },
  vendorPageTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  vendorPageCopy: {
    color: '#f5edff',
    fontWeight: '900',
    marginTop: 6,
  },
  vendorListingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  vendorListingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorListingDescription: {
    color: '#6f5d8d',
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  vendorListingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  purchaseButton: {
    flexGrow: 1,
    minWidth: 132,
    backgroundColor: '#4c1d95',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  bargainButton: {
    flexGrow: 1,
    minWidth: 132,
    backgroundColor: '#f3e8ff',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  bargainButtonDisabled: {
    backgroundColor: '#f8f4ff',
    borderColor: '#eadcff',
  },
  bargainButtonText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  bargainButtonTextDisabled: {
    color: '#9f8fb8',
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
  reelFeed: {
    paddingBottom: 16,
  },
  reelCard: {
    height: 520,
    marginBottom: 18,
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
  reelActionStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  reelVendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reelVendorHandle: {
    color: '#ffffff',
    fontWeight: '900',
  },
  subscribeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  subscribeButtonActive: {
    backgroundColor: '#ffffff',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  subscribeButtonTextActive: {
    color: '#7c3aed',
  },
  reelBottomRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelMusicText: {
    color: '#d8c4ff',
    fontWeight: '700',
    flex: 1,
  },
  reelCommentText: {
    color: '#f5edff',
    fontWeight: '800',
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
  chatPrivacyNotice: {
    backgroundColor: '#f5edff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eadcff',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chatPrivacyText: {
    flex: 1,
    color: '#6f5d8d',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 18,
  },
  threadRail: {
    marginBottom: 12,
  },
  threadChip: {
    minWidth: 176,
    maxWidth: 220,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eadcff',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  threadChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  threadChipAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadChipTextWrap: {
    flex: 1,
  },
  threadChipName: {
    color: '#251044',
    fontWeight: '900',
  },
  threadChipNameActive: {
    color: '#ffffff',
  },
  threadChipStatus: {
    color: '#7f6a9f',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  threadChipStatusActive: {
    color: '#eee7ff',
  },
  chatPanel: {
    backgroundColor: '#efe7f8',
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  chatPanelHeader: {
    backgroundColor: '#ffffff',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eadcff',
  },
  chatPanelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPanelTitleWrap: {
    flex: 1,
  },
  chatPanelName: {
    color: '#251044',
    fontWeight: '900',
    fontSize: 17,
  },
  chatPanelSubtitle: {
    color: '#7f6a9f',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  chatHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  emptyChatState: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eadcff',
  },
  dayPill: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    color: '#7f6a9f',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    minWidth: 88,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  messageBubbleTheirs: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 6,
  },
  messageBubbleMine: {
    backgroundColor: '#7c3aed',
    borderTopRightRadius: 6,
  },
  messageText: {
    color: '#251044',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  messageTextMine: {
    color: '#ffffff',
  },
  messageTime: {
    color: '#8b7aa8',
    fontSize: 10,
    fontWeight: '900',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  messageTimeMine: {
    color: '#e9d5ff',
  },
  composerRow: {
    backgroundColor: '#ffffff',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eadcff',
  },
  composerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 96,
    borderRadius: 19,
    backgroundColor: '#fbf8ff',
    color: '#251044',
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontWeight: '700',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonMuted: {
    backgroundColor: '#c4b5fd',
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
  addListingPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eadcff',
    gap: 12,
    marginBottom: 14,
  },
  kindSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f5edff',
    borderRadius: 20,
    padding: 5,
  },
  kindButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  kindButtonActive: {
    backgroundColor: '#9b5cff',
  },
  kindButtonText: {
    color: '#7c3aed',
    fontWeight: '900',
  },
  kindButtonTextActive: {
    color: '#ffffff',
  },
  photoUploadBox: {
    minHeight: 170,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#d8b4fe',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#fbf8ff',
  },
  photoUploadEmpty: {
    flex: 1,
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  photoUploadTitle: {
    color: '#251044',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },
  photoUploadCopy: {
    color: '#7f6a9f',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 190,
  },
  photoReplaceBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoReplaceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
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
    fontSize: 10,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
