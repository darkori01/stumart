import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Backend base URL. Override with EXPO_PUBLIC_API_URL (e.g. your LAN IP
// "http://192.168.1.20:4000" for a physical device). Defaults differ by
// platform: web/iOS sim can use localhost; the Android emulator maps the
// host machine to 10.0.2.2.
const DEFAULT_API_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_HOST;

// Preset choices for the vendor working-schedule pickers. Days use full names in
// a "Monday-Friday" range format; hours use a time range in the same shape.
const WORKING_DAYS_OPTIONS = [
  'Monday-Friday',
  'Monday-Saturday',
  'Monday-Sunday',
  'Tuesday-Saturday',
  'Tuesday-Sunday',
  'Saturday-Sunday',
];
const WORKING_HOURS_OPTIONS = [
  '8:00 AM - 5:00 PM',
  '9:00 AM - 6:00 PM',
  '10:00 AM - 7:00 PM',
  '11:00 AM - 8:00 PM',
  '12:00 PM - 9:00 PM',
];

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
type Tab =
  | 'Home'
  | 'Explore'
  | 'Orders'
  | 'Chats'
  | 'Profile'
  | 'Dashboard'
  | 'Products'
  | 'Reels'
  | 'Saved'
  | 'Studio';
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

type VerificationNotification = {
  purpose: VerificationPurpose;
  role: Role;
  email: string;
  code: string;
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
  // Stable identifier of the other participant, used to build the backend
  // conversationId. Both roles of the same conversation must agree on it.
  peerId: string;
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
    tint: '#744BDC',
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
    tint: '#9B68F4',
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
    tint: '#744BDC',
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
    tint: '#6E42E1',
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

const exploreTiles = [
  { title: 'Beauty', subtitle: 'Glam, hair, nails', icon: 'sparkles-outline' as IconName, color: '#6E42E1' },
  { title: 'Food', subtitle: 'Meals, cakes, snacks', icon: 'restaurant-outline' as IconName, color: '#1F4A73' },
  { title: 'Design', subtitle: 'Logos and flyers', icon: 'color-palette-outline' as IconName, color: '#5B38C9' },
  { title: 'Fashion', subtitle: 'Care, fits, styling', icon: 'shirt-outline' as IconName, color: '#744BDC' },
  { title: 'Products', subtitle: 'Fixed price finds', icon: 'cube-outline' as IconName, color: '#2F6D80' },
  { title: 'Skills', subtitle: 'Book and bargain', icon: 'construct-outline' as IconName, color: '#7A4A24' },
];

const buyerOrders = [
  {
    id: 'bo1',
    vendor: 'Ama Beauty Lab',
    item: 'Soft glam and wig styling',
    amount: 'GHS 120',
    status: 'Confirmed',
    step: 2,
    next: 'Appointment today at 5:00 PM',
  },
  {
    id: 'bo2',
    vendor: 'FreshStep Campus',
    item: 'Sneaker care kit',
    amount: 'GHS 45',
    status: 'Awaiting vendor',
    step: 1,
    next: 'Vendor is checking pickup time',
  },
  {
    id: 'bo3',
    vendor: 'Nia Design Co.',
    item: 'Logo and brand kit',
    amount: 'GHS 250',
    status: 'In progress',
    step: 3,
    next: 'First draft due Sunday',
  },
];

const buyerHistory = [
  { id: 'bh1', item: 'Mini cake box', vendor: 'Kobby Bakes', meta: 'Completed last week' },
  { id: 'bh2', item: 'Launch flyer edit', vendor: 'Nia Design Co.', meta: 'Completed in June' },
];

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
    peerId: 'vendor:ama',
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
    peerId: 'vendor:freshstep',
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
    peerId: 'vendor:nia',
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
    peerId: 'vendor:kobby',
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
    peerId: 'customer:toni',
    messages: [],
  },
  {
    id: 'vm1',
    name: 'Nana Y.',
    subtitle: 'Soft glam and wig styling',
    status: 'Order chat',
    avatar: 'N',
    tag: 'Order',
    peerId: 'customer:nana',
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
    peerId: 'customer:esi',
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
    peerId: 'customer:akua',
    messages: [
      { id: 'vm3m1', from: 'them' as const, text: 'Can we agree on GHS 90?', time: '10:32 AM' },
      { id: 'vm3m2', from: 'me' as const, text: 'GHS 90 works if you can come Saturday morning.', time: '10:35 AM' },
    ],
  },
];

const tabConfig: Record<Tab, { icon: IconName; activeIcon: IconName }> = {
  Home: { icon: 'home-outline', activeIcon: 'home' },
  Explore: { icon: 'compass-outline', activeIcon: 'compass' },
  Orders: { icon: 'receipt-outline', activeIcon: 'receipt' },
  Dashboard: { icon: 'grid-outline', activeIcon: 'grid' },
  Products: { icon: 'pricetags-outline', activeIcon: 'pricetags' },
  Reels: { icon: 'play-circle-outline', activeIcon: 'play-circle' },
  Chats: { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  Profile: { icon: 'person-outline', activeIcon: 'person' },
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
  const [lastSentVerification, setLastSentVerification] = useState<VerificationNotification | null>(null);
  const [vendorEvidenceAttached, setVendorEvidenceAttached] = useState(false);
  const [vendorWorkingDays, setVendorWorkingDays] = useState('');
  const [vendorWorkingHours, setVendorWorkingHours] = useState('');
  // Which schedule picker (if any) is currently open as a bottom sheet.
  const [schedulePicker, setSchedulePicker] = useState<
    null | { field: 'days' | 'hours'; target: 'vendor' | 'profile' }
  >(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmailLocal, setProfileEmailLocal] = useState('');
  const [profileOriginalEmail, setProfileOriginalEmail] = useState('');
  const [profileDays, setProfileDays] = useState('');
  const [profileHours, setProfileHours] = useState('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  
  // Customer profile - editable fields
  const [customerProfilePhotoUri, setCustomerProfilePhotoUri] = useState('');
  const [customerDisplayName, setCustomerDisplayName] = useState('Toni');
  const [customerDepartment, setCustomerDepartment] = useState('Computer Science');
  const [customerYear, setCustomerYear] = useState('Year 2');
  const [customerContactNumber, setCustomerContactNumber] = useState('+233 54 123 4567');
  const [customerCampusLocation, setCustomerCampusLocation] = useState('Pentagon Hostel');
  const [customerNotificationsEnabled, setCustomerNotificationsEnabled] = useState(true);
  const [isEditingCustomerProfile, setIsEditingCustomerProfile] = useState(false);
  
  // Customer profile - read-only system fields
  const [customerTotalOrders, setCustomerTotalOrders] = useState(3);
  const [customerCompletedOrders, setCustomerCompletedOrders] = useState(2);
  const [customerReviewsCount, setCustomerReviewsCount] = useState(3);
  const [customerMemberSince, setCustomerMemberSince] = useState('June 2024');
  const [customerTrustBadgeEarned, setCustomerTrustBadgeEarned] = useState(true);
  
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
  // Local-only fallback used when the backend is unreachable.
  const [sentMessagesByThread, setSentMessagesByThread] = useState<Record<string, ChatMessage[]>>({});
  // Messages loaded from the backend, keyed by deterministic conversationId.
  const [serverMessagesByConversation, setServerMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
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

  const currentAccount = useMemo(
    () => accounts.find((account) => account.email.toLowerCase() === authEmail.toLowerCase() && account.role === role),
    [accounts, authEmail, role],
  );
  const vendorListings = useMemo(
    () => marketListings.filter((listing) => listing.vendor === demoVendorName),
    [marketListings],
  );
  const savedListings = marketListings.filter((listing) => savedIds.includes(listing.id));
  const chatThreads = role === 'vendor' ? vendorChatThreads : customerChatThreads;
  const selectedChat = selectedChatId ? chatThreads.find((thread) => thread.id === selectedChatId) ?? null : null;

  // Stable identity for the logged-in user. Both roles of a conversation agree
  // on the pair of ids, so the backend conversationId matches on both sides.
  const selfId = role === 'vendor' ? 'vendor:ama' : 'customer:toni';
  const conversationIdFor = (thread: ChatThread) =>
    [selfId, thread.peerId].sort().join('__');

  const formatClock = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Merge the thread's seeded demo messages with whatever the backend has.
  const messagesForThread = (thread: ChatThread): ChatMessage[] => {
    const server = serverMessagesByConversation[conversationIdFor(thread)];
    if (server && server.length) return [...thread.messages, ...server];
    return [...thread.messages, ...(sentMessagesByThread[thread.id] ?? [])];
  };

  const selectedMessages = selectedChat ? messagesForThread(selectedChat) : [];
  const vendorPageListings = vendorPageListing
    ? marketListings.filter((listing) => listing.vendor === vendorPageListing.vendor)
    : [];

  const parsePriceNumber = (priceStr: string | undefined) => {
    if (!priceStr) return NaN;
    const m = priceStr.replace(/[,]/g, '').match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[0]) : NaN;
  };

  const computeAverageAmount = (items: Listing[]) => {
    const nums = items.map((i) => parsePriceNumber(i.price)).filter((n) => !Number.isNaN(n));
    if (!nums.length) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    return Math.round(sum / nums.length);
  };

  const vendorMetaMap: Record<string, { days: string; hours: string }> = {
    'Ama Beauty Lab': { days: 'Mon - Sat', hours: '10:00 AM - 7:00 PM' },
    'Kobby Bakes': { days: 'Tue - Sat', hours: '9:00 AM - 6:00 PM' },
    'Nia Design Co.': { days: 'Mon - Fri', hours: '9:00 AM - 5:00 PM' },
  };


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

  const EMAIL_SERVER = API_BASE;

  const sendVerificationEmail = async (
    email: string,
    code: string,
    purpose: VerificationPurpose,
    role: Role,
  ) => {
    const title = purpose === 'forgot' ? 'Password reset code sent' : 'Signup code sent';
    setLastSentVerification({ email, code, purpose, role });
    setAuthMessage(`A verification code was sent to ${email}.`);

    try {
      const res = await fetch(`${EMAIL_SERVER}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, purpose }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.info === 'smtp-not-configured') {
          Alert.alert(title, `SMTP not configured on the email server. Demo email code: ${code}`);
        } else {
          Alert.alert(title, `A verification code was sent to ${email}.`);
        }
      } else {
        Alert.alert('Unable to send verification', `Server error sending email. Demo code: ${code}`);
      }
    } catch (err) {
      // fallback to demo behavior when no server is reachable
      Alert.alert(title, `Unable to contact email server. Demo email code: ${code}`);
    }
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
    sendVerificationEmail(normalizedEmail, code, 'forgot', role);
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
    sendVerificationEmail(normalizedEmail, code, 'signup', role);
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

    if (pendingVerification.role === 'vendor') {
      if (!vendorEvidenceAttached) {
        setAuthMessage('Vendors must attach school ID evidence before the account can be submitted.');
        return;
      }
      if (!vendorWorkingDays.trim() || !vendorWorkingHours.trim()) {
        setAuthMessage('Please enter your working days and hours.');
        return;
      }
    }

    const newAccount = {
      email: pendingVerification.email,
      password: newPassword,
      role: pendingVerification.role,
      name: pendingVerification.name,
      verificationStatus: pendingVerification.role === 'vendor' ? 'pending' : 'verified',
      hasSchoolIdEvidence: pendingVerification.role === 'vendor',
      vendorMeta: pendingVerification.role === 'vendor' ? { days: vendorWorkingDays, hours: vendorWorkingHours } : undefined,
    } as Account & { vendorMeta?: { days: string; hours: string } };

    setAccounts((current) => [...current, newAccount]);

    // Persist vendor metadata to server if vendor
    if (pendingVerification.role === 'vendor') {
      (async () => {
        try {
          await fetch(`${EMAIL_SERVER}/vendors/${encodeURIComponent(newAccount.name)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days: vendorWorkingDays, hours: vendorWorkingHours }),
          });
        } catch (e) {
          // ignore server errors in demo mode
        }
      })();
    }
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

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('Home');
  };

  const openProfile = async () => {
    setIsEditingProfile(false);
    // load current account info
    const current = currentAccount;
    if (current) {
      setProfileName(current.name || '');
      setProfileEmailLocal(current.email || '');
      setProfileOriginalEmail(current.email || '');
      if (current.role === 'vendor') {
        // try fetch vendor meta from server
        try {
          const res = await fetch(`${EMAIL_SERVER}/vendors/${encodeURIComponent(current.name)}`);
          if (res.ok) {
            const data = await res.json();
            setProfileDays(data.days || '');
            setProfileHours(data.hours || '');
          } else {
            setProfileDays('');
            setProfileHours('');
          }
        } catch (e) {
          setProfileDays('');
          setProfileHours('');
        }
      } else {
        setProfileDays('');
        setProfileHours('');
      }
    }
    setShowProfileModal(true);
  };

  const saveProfileChanges = async () => {
    const trimmedName = profileName.trim();
    const normalizedEmail = profileEmailLocal.trim().toLowerCase();
    const originalEmail = (profileOriginalEmail || authEmail).toLowerCase();
    const acct = accounts.find((a) => a.email.toLowerCase() === originalEmail && a.role === role);

    if (!trimmedName || !isValidEmail(normalizedEmail)) {
      Alert.alert('Update profile', 'Enter a name and a valid email before saving.');
      return;
    }

    const emailTaken = accounts.some(
      (account) =>
        account.role === role &&
        account.email.toLowerCase() === normalizedEmail &&
        account.email.toLowerCase() !== originalEmail,
    );

    if (emailTaken) {
      Alert.alert('Email already used', 'Use another email for this profile.');
      return;
    }

    if (!acct) {
      Alert.alert('Update profile', 'Open your profile again before saving changes.');
      return;
    }

    const oldName = acct.name;
    const updatedAccount: Account = { ...acct, name: trimmedName, email: normalizedEmail };

    setAccounts((current) =>
      current.map((account) =>
        account.email.toLowerCase() === originalEmail && account.role === role ? updatedAccount : account,
      ),
    );
    setAuthEmail(normalizedEmail);

    // update listings vendor name if this is a vendor and name changed
    if (acct.role === 'vendor' && oldName && oldName !== trimmedName) {
      setMarketListings((current) => current.map((listing) => (
        listing.vendor === oldName ? { ...listing, vendor: trimmedName } : listing
      )));
      // update vendorPageListing if open
      if (vendorPageListing && vendorPageListing.vendor === oldName) {
        setVendorPageListing((prev) => prev ? { ...prev, vendor: trimmedName } : prev);
      }
    }

    // if vendor, persist vendor meta to server (use profileName as key)
    if (acct.role === 'vendor') {
      try {
        await fetch(`${EMAIL_SERVER}/vendors/${encodeURIComponent(trimmedName)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: profileDays, hours: profileHours }),
        });
      } catch (e) {
        // ignore
      }
    }

    setIsEditingProfile(false);
    // refresh local profile display
    setProfileName(trimmedName);
    setProfileEmailLocal(normalizedEmail);
    setProfileOriginalEmail(normalizedEmail);
    setProfileDays(profileDays);
    setProfileHours(profileHours);
    setShowProfileModal(false);
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
      tint: newListingKind === 'Skill' ? '#744BDC' : '#744BDC',
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

  const getThreadMessages = (thread: ChatThread) => messagesForThread(thread);

  // Pull a conversation's full history from the backend and cache it.
  const loadConversation = async (thread: ChatThread) => {
    const conversationId = conversationIdFor(thread);
    try {
      const res = await fetch(`${EMAIL_SERVER}/chats/${encodeURIComponent(conversationId)}`);
      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows)) return;
      const mapped: ChatMessage[] = rows.map((m: any) => ({
        id: m.id,
        from: m.from === selfId ? 'me' : 'them',
        text: m.text,
        time: formatClock(m.ts),
      }));
      setServerMessagesByConversation((current) => ({ ...current, [conversationId]: mapped }));
    } catch (e) {
      // Backend unreachable — keep showing seeded/local messages.
    }
  };

  // Local-only fallback when the backend cannot be reached.
  const sendMessageLocally = (thread: ChatThread, text: string) => {
    const now = new Date();
    const time = formatClock(now.getTime());
    const nextMessage: ChatMessage = { id: `${thread.id}-${now.getTime()}`, from: 'me', text, time };
    const linkedThreadId = getLinkedThreadId(thread.id);
    const linkedMessage: ChatMessage = {
      id: `${linkedThreadId ?? thread.id}-${now.getTime()}`,
      from: 'them',
      text,
      time,
    };
    setSentMessagesByThread((current) => ({
      ...current,
      [thread.id]: [...(current[thread.id] ?? []), nextMessage],
      ...(linkedThreadId
        ? { [linkedThreadId]: [...(current[linkedThreadId] ?? []), linkedMessage] }
        : {}),
    }));
  };

  const sendMessage = () => {
    const trimmedMessage = messageDraft.trim();
    if (!trimmedMessage || !selectedChat) {
      return;
    }

    const thread = selectedChat;
    setMessageDraft('');

    (async () => {
      try {
        const res = await fetch(`${EMAIL_SERVER}/chats/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: selfId, to: thread.peerId, text: trimmedMessage }),
        });
        if (!res.ok) throw new Error(`send failed: ${res.status}`);
        await loadConversation(thread);
      } catch (e) {
        // Persist locally so the message is not lost when offline.
        sendMessageLocally(thread, trimmedMessage);
      }
    })();
  };

  // Load history when a chat opens and poll so the other party's replies appear.
  useEffect(() => {
    if (!selectedChatId) return;
    const thread = chatThreads.find((t) => t.id === selectedChatId);
    if (!thread) return;
    loadConversation(thread);
    const interval = setInterval(() => loadConversation(thread), 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId, role]);

  // Shared vendor working-schedule picker (days / hours). Rendered in both the
  // signup/auth screen and the logged-in app so the arrow pickers work in both.
  const scheduleModal = (
    <Modal
      visible={schedulePicker !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setSchedulePicker(null)}
    >
      <Pressable style={styles.pickerBackdrop} onPress={() => setSchedulePicker(null)}>
        <Pressable style={styles.pickerSheet} onPress={() => {}}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerSheetTitle}>
            {schedulePicker?.field === 'days' ? 'Select working days' : 'Select working hours'}
          </Text>
          {(schedulePicker?.field === 'days' ? WORKING_DAYS_OPTIONS : WORKING_HOURS_OPTIONS).map((option) => {
            const currentValue =
              schedulePicker?.target === 'profile'
                ? schedulePicker.field === 'days'
                  ? profileDays
                  : profileHours
                : schedulePicker?.field === 'days'
                ? vendorWorkingDays
                : vendorWorkingHours;
            const selected = currentValue === option;
            return (
              <Pressable
                key={option}
                style={[styles.pickerOption, selected && styles.pickerOptionSelected]}
                onPress={() => {
                  if (!schedulePicker) return;
                  if (schedulePicker.target === 'profile') {
                    if (schedulePicker.field === 'days') setProfileDays(option);
                    else setProfileHours(option);
                  } else {
                    if (schedulePicker.field === 'days') setVendorWorkingDays(option);
                    else setVendorWorkingHours(option);
                  }
                  setSchedulePicker(null);
                }}
              >
                <Text style={[styles.pickerOptionText, selected && styles.pickerOptionTextSelected]}>
                  {option}
                </Text>
                {selected && <Ionicons name="checkmark" size={18} color="#5B38C9" />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (isLoading) {
    return (
      <LinearGradient colors={['#5B38C9', '#9B68F4']} style={styles.loadingShell}>
        <StatusBar style="light" />
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
      <LinearGradient colors={['#FEFEFE', '#FFFFFF']} style={styles.authShell}>
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
                    color={role === option ? '#ffffff' : '#6E42E1'}
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
                <Ionicons name="logo-google" size={17} color="#6E42E1" />
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
                placeholderTextColor="#9A8CBF"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Password</Text>
              <TextInput
                value={authPassword}
                onChangeText={setAuthPassword}
                placeholder="********"
                placeholderTextColor="#9A8CBF"
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
                  <Ionicons name="person-add-outline" size={22} color="#5B38C9" />
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
                placeholderTextColor="#9A8CBF"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Student email</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder={role === 'vendor' ? 'vendor@email.com' : 'student@email.com'}
                placeholderTextColor="#9A8CBF"
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
                  <Ionicons name="mail-unread-outline" size={22} color="#5B38C9" />
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
                placeholderTextColor="#9A8CBF"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.underlinedInput}
              />

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}
              {lastSentVerification?.email === pendingVerification?.email &&
                lastSentVerification?.purpose === pendingVerification?.purpose && (
                  <Text style={styles.authHint}>Demo email code: {lastSentVerification?.code}</Text>
                )}

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
                      pendingVerification.role,
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
                  <Ionicons name="lock-closed-outline" size={22} color="#6E42E1" />
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
                placeholderTextColor="#9A8CBF"
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
                    color={vendorEvidenceAttached ? '#ffffff' : '#744BDC'}
                  />
                  <Text style={[styles.evidenceText, vendorEvidenceAttached && styles.evidenceTextReady]}>
                    {vendorEvidenceAttached ? 'School ID photo attached' : 'Attach school ID photo'}
                  </Text>
                </Pressable>
              )}

              {pendingVerification?.role === 'vendor' && (
                <>
                  <Text style={[styles.formLabel, { marginTop: 12 }]}>Working days</Text>
                  <Pressable style={styles.pickerField} onPress={() => setSchedulePicker({ field: 'days', target: 'vendor' })}>
                    <Text style={vendorWorkingDays ? styles.pickerFieldText : styles.pickerFieldPlaceholder}>
                      {vendorWorkingDays || 'Select working days'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#744BDC" />
                  </Pressable>
                  <Text style={styles.formLabel}>Working hours</Text>
                  <Pressable style={styles.pickerField} onPress={() => setSchedulePicker({ field: 'hours', target: 'vendor' })}>
                    <Text style={vendorWorkingHours ? styles.pickerFieldText : styles.pickerFieldPlaceholder}>
                      {vendorWorkingHours || 'Select working hours'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#744BDC" />
                  </Pressable>
                </>
              )}

              {pendingVerification?.role === 'vendor' && (
                <View style={styles.verificationNote}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#5B38C9" />
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
                  <Ionicons name="logo-google" size={22} color="#5B38C9" />
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
                placeholderTextColor="#9A8CBF"
                style={styles.underlinedInput}
              />
              <Text style={styles.formLabel}>Google email</Text>
              <TextInput
                value={authEmail}
                onChangeText={setAuthEmail}
                placeholder={role === 'vendor' ? 'vendor@gmail.com' : 'student@gmail.com'}
                placeholderTextColor="#9A8CBF"
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
                    color={vendorEvidenceAttached ? '#ffffff' : '#6E42E1'}
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
                  <Ionicons name="key-outline" size={22} color="#5B38C9" />
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
                placeholderTextColor="#9A8CBF"
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
                  <Ionicons name="mail-open-outline" size={22} color="#5B38C9" />
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
                placeholderTextColor="#9A8CBF"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.underlinedInput}
              />

              {!!authMessage && <Text style={styles.authMessage}>{authMessage}</Text>}
              {lastSentVerification?.email === pendingVerification?.email &&
                lastSentVerification?.purpose === pendingVerification?.purpose && (
                  <Text style={styles.authHint}>Demo email code: {lastSentVerification?.code}</Text>
                )}

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
                      pendingVerification.role,
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
                  <Ionicons name="shield-checkmark-outline" size={22} color="#5B38C9" />
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
                placeholderTextColor="#9A8CBF"
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

        {/* Vendor working-schedule picker (days / hours) */}
        {scheduleModal}
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Vendor working-schedule picker (days / hours) */}
        {scheduleModal}

        {/* Profile modal */}
        <Modal visible={showProfileModal} transparent animationType="fade" onRequestClose={() => setShowProfileModal(false)}>
          <View style={styles.profileModal}>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={28} color="#744BDC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileNameText}>{profileName || (role === 'vendor' ? 'Business name' : 'Your name')}</Text>
                  <Text style={styles.profileSubText}>{profileEmailLocal}</Text>
                </View>
                <Pressable onPress={() => setShowProfileModal(false)}>
                  <Ionicons name="close" size={20} color="#655A88" />
                </Pressable>
              </View>

              <View style={styles.profileBody}>
                <View style={styles.profileRow}>
                  <Text style={styles.profileLabel}>Email</Text>
                  <Text style={styles.profileValue}>{profileEmailLocal}</Text>
                </View>

                {role === 'vendor' && (
                  <>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Working days</Text>
                      <Text style={styles.profileValue}>{profileDays || '—'}</Text>
                    </View>
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Working hours</Text>
                      <Text style={styles.profileValue}>{profileHours || '—'}</Text>
                    </View>
                  </>
                )}

                <View style={styles.profileActions}>
                  <Pressable onPress={() => { setShowProfileModal(false); setShowProfileEditor(true); }} style={{ padding: 8 }}>
                    <Text style={{ color: '#6E42E1', fontWeight: '800' }}>Edit profile</Text>
                  </Pressable>
                  <Pressable onPress={() => { setShowProfileModal(false); logout(); }} style={{ padding: 8 }}>
                    <Text style={{ color: '#d32f2f', fontWeight: '800' }}>Logout</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <LinearGradient colors={['#6E42E1', '#9B68F4']} style={styles.topCard}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
              <View style={styles.brandTitleWrap}>
                <Text style={styles.smallLabel}>Welcome back</Text>
                <Text style={styles.appTitle} numberOfLines={1}>{isAuthenticated ? (accounts.find(a => a.email.toLowerCase() === authEmail.toLowerCase())?.name ?? (role === 'vendor' ? 'Your business' : 'Stumart')) : (role === 'vendor' ? 'Ama Beauty Lab' : 'Stumart')}</Text>
              </View>
            </View>
            <Pressable style={styles.profilePill} onPress={() => openProfile()}>
              <Ionicons name="person-circle" size={28} color="#744BDC" />
            </Pressable>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#FFFFFF" />
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

        {/* Full-screen profile editor */}
        <Modal visible={showProfileEditor} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ padding: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Pressable onPress={() => setShowProfileEditor(false)}>
                  <Ionicons name="close" size={24} color="#6E42E1" />
                </Pressable>
                <Text style={{ fontSize: 18, fontWeight: '900' }}>Edit Profile</Text>
                <Pressable onPress={saveProfileChanges}>
                  <Text style={{ color: '#6E42E1', fontWeight: '800' }}>Save</Text>
                </Pressable>
              </View>

              <ScrollView style={{ marginTop: 18 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.formLabel}>{role === 'vendor' ? 'Business name' : 'Full name'}</Text>
                <TextInput value={profileName} onChangeText={setProfileName} style={styles.editorInput} />

                <Text style={styles.formLabel}>Email</Text>
                <TextInput value={profileEmailLocal} onChangeText={setProfileEmailLocal} style={styles.editorInput} />

                {role === 'vendor' && (
                  <>
                    <Text style={styles.formLabel}>Working days</Text>
                    <Pressable style={styles.pickerField} onPress={() => setSchedulePicker({ field: 'days', target: 'profile' })}>
                      <Text style={profileDays ? styles.pickerFieldText : styles.pickerFieldPlaceholder}>
                        {profileDays || 'Select working days'}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color="#744BDC" />
                    </Pressable>

                    <Text style={styles.formLabel}>Working hours</Text>
                    <Pressable style={styles.pickerField} onPress={() => setSchedulePicker({ field: 'hours', target: 'profile' })}>
                      <Text style={profileHours ? styles.pickerFieldText : styles.pickerFieldPlaceholder}>
                        {profileHours || 'Select working hours'}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color="#744BDC" />
                    </Pressable>
                  </>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>

        {role === 'vendor' && activeTab === 'Dashboard' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Business dashboard</Text>
              <Text style={styles.sectionMeta}>Today</Text>
            </View>

            <LinearGradient colors={['#4D2EB7', '#9B68F4']} style={styles.vendorRevenueCard}>
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
                  <Ionicons name="receipt-outline" size={20} color="#1F4A73" />
                </View>
                <Text style={styles.metricValue}>{activeOrders.length}</Text>
                <Text style={styles.metricLabel}>Active orders</Text>
              </View>
              <View style={styles.vendorMetricCard}>
                <View style={[styles.metricIconWrap, styles.metricIconPurple]}>
                  <Ionicons name="chatbubbles-outline" size={20} color="#6E42E1" />
                </View>
                <Text style={styles.metricValue}>{vendorMessages.length}</Text>
                <Text style={styles.metricLabel}>Unread chats</Text>
              </View>
              <View style={styles.vendorMetricCard}>
                <View style={[styles.metricIconWrap, styles.metricIconAmber]}>
                  <Ionicons name="storefront-outline" size={20} color="#744BDC" />
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
                  <Ionicons name={item.icon} size={21} color="#6E42E1" />
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
                  <Ionicons name="bag-check-outline" size={20} color="#5B38C9" />
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
                  <LinearGradient colors={['#6E42E1', '#9B68F4']} style={styles.chatAvatar}>
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
              <Ionicons name="information-circle-outline" size={20} color="#5B38C9" />
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
                <Ionicons name="chevron-back" size={19} color="#6E42E1" />
                <Text style={styles.backButtonText}>Back to dashboard</Text>
              </Pressable>

              <ImageBackground
                source={{ uri: vendorPageListing.image }}
                imageStyle={styles.vendorPageImage}
                style={styles.vendorPageHero}
              >
                <LinearGradient colors={['rgba(31, 74, 115, 0.15)', 'rgba(31, 74, 115, 0.92)']} style={styles.vendorPageShade}>
                  <View style={styles.vendorPageBadge}>
                    <Ionicons name="storefront" size={15} color="#6E42E1" />
                    <Text style={styles.vendorPageBadgeText}>{vendorPageListings.length} listing</Text>
                  </View>
                  <Text style={styles.vendorPageTitle}>{vendorPageListing.vendor}</Text>
                  <Text style={styles.vendorPageCopy}>{vendorPageListing.campus}</Text>
                </LinearGradient>
              </ImageBackground>

                {/* Vendor quick info: working days, hours, average amount */}
                <View style={styles.vendorInfoCard}>
                  <View style={styles.vendorInfoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#744BDC" />
                    <Text style={styles.vendorInfoText}>{(vendorMetaMap[vendorPageListing.vendor]?.days) ?? 'Mon - Sat'}</Text>
                  </View>
                  <View style={styles.vendorInfoRow}>
                    <Ionicons name="time-outline" size={18} color="#5B38C9" />
                    <Text style={styles.vendorInfoText}>{(vendorMetaMap[vendorPageListing.vendor]?.hours) ?? '10:00 AM - 7:00 PM'}</Text>
                  </View>
                  <View style={styles.vendorInfoRow}>
                    <Ionicons name="cash-outline" size={18} color="#5B38C9" />
                    <Text style={styles.vendorInfoText}>{computeAverageAmount(vendorPageListings) ? `Avg: GHS ${computeAverageAmount(vendorPageListings)}` : 'Avg: —'}</Text>
                  </View>
                </View>

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
                          color="#6E42E1"
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
                        <Ionicons name="pricetag" size={17} color={canBargain ? '#5B38C9' : '#B3A8CE'} />
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
              <Ionicons name="search" size={20} color="#5B38C9" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search braids, cakes, logos..."
                placeholderTextColor="#9A8CBF"
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
                  colors={['rgba(255,255,255,0.05)', 'rgba(31, 74, 115, 0.85)']}
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
              <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.detailPanel}>
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
                      <Ionicons name="pricetag" size={17} color="#6E42E1" />
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
                  <LinearGradient colors={['transparent', 'rgba(9, 5, 20, 0.95)']} style={styles.reelOverlay}>
                    <View style={styles.reelTopRow}>
                      <Text style={styles.reelBadge}>{reel.views} views</Text>
                      <View style={styles.reelActionStrip}>
                        <Pressable style={styles.reelIconButton} onPress={() => toggleReelLike(reel.id)}>
                          <Ionicons
                            name={likedReels.includes(reel.id) ? 'heart' : 'heart-outline'}
                            size={24}
                            color={likedReels.includes(reel.id) ? '#9B68F4' : '#ffffff'}
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


        {role === 'customer' && activeTab === 'Explore' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore</Text>
              <Text style={styles.sectionMeta}>Skills and categories</Text>
            </View>

            <View style={styles.exploreGrid}>
              {exploreTiles.map((tile) => (
                <Pressable
                  key={tile.title}
                  style={styles.exploreTile}
                  onPress={() => {
                    if (categories.includes(tile.title)) {
                      setActiveCategory(tile.title);
                    } else {
                      setActiveCategory('All');
                    }
                    setActiveTab('Home');
                  }}
                >
                  <View style={[styles.exploreIcon, { backgroundColor: `${tile.color}18` }]}>
                    <Ionicons name={tile.icon} size={24} color={tile.color} />
                  </View>
                  <Text style={styles.exploreTitle}>{tile.title}</Text>
                  <Text style={styles.exploreSubtitle}>{tile.subtitle}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured sellers</Text>
              <Text style={styles.sectionMeta}>Ready to order</Text>
            </View>

            {marketListings.slice(0, 4).map((listing) => (
              <Pressable key={listing.id} style={styles.discoveryRow} onPress={() => openVendorListingPage(listing)}>
                <Image source={{ uri: listing.image }} style={styles.discoveryImage} />
                <View style={styles.chatBody}>
                  <Text style={styles.chatName}>{listing.title}</Text>
                  <Text style={styles.chatLast}>{listing.vendor} - {listing.category}</Text>
                </View>
                <Text style={styles.discoveryPrice}>{listing.price}</Text>
              </Pressable>
            ))}
          </>
        )}

        {role === 'customer' && activeTab === 'Orders' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Orders</Text>
              <Text style={styles.sectionMeta}>{buyerOrders.length} active</Text>
            </View>

            <View style={styles.orderSummaryBand}>
              <View style={styles.flex}>
                <Text style={styles.orderSummaryLabel}>Buyer requests</Text>
                <Text style={styles.orderSummaryValue}>Track every order from request to completion.</Text>
              </View>
              <Ionicons name="bag-check-outline" size={30} color="#ffffff" />
            </View>

            {buyerOrders.map((order) => (
              <View key={order.id} style={styles.buyerOrderCard}>
                <View style={styles.buyerOrderTop}>
                  <View style={styles.orderIcon}>
                    <Ionicons name="receipt-outline" size={20} color="#5B38C9" />
                  </View>
                  <View style={styles.chatBody}>
                    <Text style={styles.chatName}>{order.item}</Text>
                    <Text style={styles.chatLast}>{order.vendor}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderAmount}>{order.amount}</Text>
                    <Text style={styles.orderStatus}>{order.status}</Text>
                  </View>
                </View>
                <View style={styles.statusTrack}>
                  {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={[styles.statusDot, step <= order.step && styles.statusDotActive]} />
                  ))}
                </View>
                <Text style={styles.orderNext}>{order.next}</Text>
                <Pressable
                  style={styles.orderChatButton}
                  onPress={() => {
                    const thread = customerChatThreads.find((chat) => chat.name === order.vendor);
                    setSelectedChatId(thread?.id ?? null);
                    setActiveTab('Chats');
                  }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={17} color="#6E42E1" />
                  <Text style={styles.orderChatButtonText}>Open order chat</Text>
                </Pressable>
              </View>
            ))}
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
                  <Ionicons name="lock-closed-outline" size={19} color="#6E42E1" />
                  <Text style={styles.chatPrivacyText}>
                    Select a contact to open a private conversation.
                  </Text>
                </View>

                {chatThreads.map((thread) => {
                  const threadMessages = getThreadMessages(thread);
                  const lastMessage = threadMessages[threadMessages.length - 1];
                  return (
                    <Pressable key={thread.id} style={styles.chatRow} onPress={() => openChatThread(thread.id)}>
                      <LinearGradient colors={['#6E42E1', '#9B68F4']} style={styles.chatAvatar}>
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
                    <Ionicons name="chevron-back" size={20} color="#6E42E1" />
                  </Pressable>
                  <LinearGradient colors={['#6E42E1', '#9B68F4']} style={styles.chatPanelAvatar}>
                    <Text style={styles.chatAvatarText}>{selectedChat.avatar}</Text>
                  </LinearGradient>
                  <View style={styles.chatPanelTitleWrap}>
                    <Text style={styles.chatPanelName}>{selectedChat.name}</Text>
                    <Text style={styles.chatPanelSubtitle}>{selectedChat.subtitle}</Text>
                  </View>
                  <Pressable style={styles.chatHeaderIcon}>
                    <Ionicons name="call-outline" size={20} color="#6E42E1" />
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
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#5B38C9" />
                      <Text style={styles.emptyTitle}>No messages yet</Text>
                      <Text style={styles.emptyCopy}>Start the conversation when you are ready.</Text>
                    </View>
                  )}
                </View>

                <View style={styles.composerRow}>
                  <Pressable style={styles.composerIcon}>
                    <Ionicons name="add" size={21} color="#6E42E1" />
                  </Pressable>
                  <TextInput
                    value={messageDraft}
                    onChangeText={setMessageDraft}
                    placeholder={role === 'vendor' ? 'Reply to customer' : 'Message vendor'}
                    placeholderTextColor="#9A8CBF"
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

        {role === 'customer' && activeTab === 'Profile' && (
          <>
            {!isEditingCustomerProfile ? (
              <>
                {/* Section 1: Read-only System Info */}
                <View style={styles.profileReadOnlySection}>
                  <View style={styles.profilePhotoLarge}>
                    {customerProfilePhotoUri ? (
                      <Image source={{ uri: customerProfilePhotoUri }} style={styles.profilePhotoImage} />
                    ) : (
                      <View style={styles.profilePhotoPlaceholder}>
                        <Ionicons name="person-circle" size={80} color="#6E42E1" />
                      </View>
                    )}
                  </View>

                  <View style={styles.profileHeaderInfo}>
                    <View style={styles.profileNameRow}>
                      <Text style={styles.profileFullName}>{currentAccount?.name}</Text>
                      {currentAccount?.verificationStatus === 'verified' && (
                        <Ionicons name="checkmark-circle" size={18} color="#6E42E1" />
                      )}
                    </View>
                    <Text style={styles.profileInstitution}>University of Ghana, Legon</Text>
                  </View>

                  {/* Stats Row */}
                  <View style={styles.profileStatsContainer}>
                    <View style={styles.profileStatItem}>
                      <Text style={styles.profileStatNumber}>{customerTotalOrders}</Text>
                      <Text style={styles.profileStatLabel}>Total orders</Text>
                    </View>
                    <View style={styles.profileStatDivider} />
                    <View style={styles.profileStatItem}>
                      <Text style={styles.profileStatNumber}>{customerCompletedOrders}</Text>
                      <Text style={styles.profileStatLabel}>Completed</Text>
                    </View>
                    <View style={styles.profileStatDivider} />
                    <View style={styles.profileStatItem}>
                      <Text style={styles.profileStatNumber}>{customerReviewsCount}</Text>
                      <Text style={styles.profileStatLabel}>Reviews</Text>
                    </View>
                  </View>

                  {/* Member Info */}
                  <View style={styles.profileMetaRow}>
                    <Ionicons name="calendar-outline" size={16} color="#655A88" />
                    <Text style={styles.profileMetaText}>Member since {customerMemberSince}</Text>
                  </View>

                  {/* Trust Badge */}
                  {customerTrustBadgeEarned && (
                    <View style={styles.profileTrustBadgeContainer}>
                      <LinearGradient colors={['#6E42E1', '#9B68F4']} style={styles.trustBadgeGradient}>
                        <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                        <Text style={styles.trustBadgeText}>Trusted Buyer</Text>
                        <Text style={styles.trustBadgeSubtext}>5+ completed orders</Text>
                      </LinearGradient>
                    </View>
                  )}

                  <Pressable
                    style={styles.editProfileButton}
                    onPress={() => {
                      setIsEditingCustomerProfile(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#ffffff" />
                    <Text style={styles.editProfileButtonText}>Edit profile</Text>
                  </Pressable>
                </View>

                {/* Section 2: Editable Profile Info Preview */}
                <View style={styles.profileEditablePreview}>
                  <Text style={styles.profileSectionTitle}>Your information</Text>

                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Display name</Text>
                    <Text style={styles.profileInfoValue}>{customerDisplayName}</Text>
                  </View>

                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Department & year</Text>
                    <Text style={styles.profileInfoValue}>{customerDepartment} • {customerYear}</Text>
                  </View>

                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Contact number</Text>
                    <Text style={styles.profileInfoValue}>{customerContactNumber}</Text>
                  </View>

                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Campus location</Text>
                    <Text style={styles.profileInfoValue}>{customerCampusLocation}</Text>
                  </View>

                  <View style={styles.profileNotificationRow}>
                    <View>
                      <Text style={styles.profileInfoLabel}>Order notifications</Text>
                      <Text style={styles.profileInfoDescription}>
                        {customerNotificationsEnabled ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <View style={styles.profileEditHeader}>
                  <Pressable onPress={() => setIsEditingCustomerProfile(false)}>
                    <Ionicons name="chevron-back" size={24} color="#6E42E1" />
                  </Pressable>
                  <Text style={styles.profileEditTitle}>Edit profile</Text>
                  <View style={{ width: 24 }} />
                </View>

                <Pressable style={styles.profilePhotoEditBox} onPress={() => {
                  // In real app, open image picker
                  Alert.alert('Photo picker', 'Select a new profile photo');
                }}>
                  {customerProfilePhotoUri ? (
                    <Image source={{ uri: customerProfilePhotoUri }} style={styles.profilePhotoImageEdit} />
                  ) : (
                    <View style={styles.profilePhotoPlaceholder}>
                      <Ionicons name="camera-outline" size={40} color="#6E42E1" />
                    </View>
                  )}
                  <View style={styles.photoEditBadge}>
                    <Ionicons name="camera" size={14} color="#ffffff" />
                  </View>
                </Pressable>

                <View style={styles.profileEditSection}>
                  <View style={styles.editFieldGroup}>
                    <Text style={styles.editFieldLabel}>Display name</Text>
                    <TextInput
                      value={customerDisplayName}
                      onChangeText={setCustomerDisplayName}
                      style={styles.editFieldInput}
                      placeholderTextColor="#9A8CBF"
                    />
                  </View>

                  <View style={styles.editFieldGroup}>
                    <Text style={styles.editFieldLabel}>Department</Text>
                    <TextInput
                      value={customerDepartment}
                      onChangeText={setCustomerDepartment}
                      style={styles.editFieldInput}
                      placeholderTextColor="#9A8CBF"
                    />
                  </View>

                  <View style={styles.editFieldGroup}>
                    <Text style={styles.editFieldLabel}>Year of study</Text>
                    <TextInput
                      value={customerYear}
                      onChangeText={setCustomerYear}
                      style={styles.editFieldInput}
                      placeholderTextColor="#9A8CBF"
                    />
                  </View>

                  <View style={styles.editFieldGroup}>
                    <Text style={styles.editFieldLabel}>Contact number</Text>
                    <TextInput
                      value={customerContactNumber}
                      onChangeText={setCustomerContactNumber}
                      style={styles.editFieldInput}
                      placeholderTextColor="#9A8CBF"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.editFieldGroup}>
                    <Text style={styles.editFieldLabel}>Campus/Hostel</Text>
                    <TextInput
                      value={customerCampusLocation}
                      onChangeText={setCustomerCampusLocation}
                      style={styles.editFieldInput}
                      placeholderTextColor="#9A8CBF"
                    />
                  </View>

                  <View style={styles.editFieldGroup}>
                    <View style={styles.notificationToggleRow}>
                      <View>
                        <Text style={styles.editFieldLabel}>Order notifications</Text>
                        <Text style={styles.editFieldDescription}>
                          Get updates on orders and messages
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => setCustomerNotificationsEnabled(!customerNotificationsEnabled)}
                        style={[
                          styles.toggleSwitch,
                          customerNotificationsEnabled && styles.toggleSwitchActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.toggleCircle,
                            customerNotificationsEnabled && styles.toggleCircleActive,
                          ]}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <Pressable
                  style={styles.savProfileButton}
                  onPress={() => {
                    setIsEditingCustomerProfile(false);
                    Alert.alert('Success', 'Your profile has been updated.');
                  }}
                >
                  <Text style={styles.savProfileButtonText}>Save changes</Text>
                </Pressable>
              </>
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
                <LinearGradient colors={['#5B38C9', '#9B68F4']} style={styles.studioHero}>
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
                      <Ionicons name={item.icon} size={22} color="#6E42E1" />
                      <Text style={styles.studioActionText}>{item.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#744BDC" />
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <Pressable style={styles.backButton} onPress={closeAddListingForm}>
                  <Ionicons name="chevron-back" size={19} color="#6E42E1" />
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
                          color={newListingKind === kind ? '#ffffff' : '#6E42E1'}
                        />
                        <Text style={[styles.kindButtonText, newListingKind === kind && styles.kindButtonTextActive]}>
                          {kind}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.ruleBox}>
                    <Ionicons name="pricetag-outline" size={18} color="#6E42E1" />
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
                        <Ionicons name="image-outline" size={28} color="#6E42E1" />
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
                    placeholderTextColor="#9A8CBF"
                    style={styles.input}
                  />
                  <TextInput
                    value={newListingPrice}
                    onChangeText={setNewListingPrice}
                    placeholder="Price, e.g. GHS 120"
                    placeholderTextColor="#9A8CBF"
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
          : (['Home', 'Explore', 'Orders', 'Chats', 'Profile'] as Tab[])
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
                color={isActive ? '#6E42E1' : '#655A88'}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
                {tab}
              </Text>
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
        <LinearGradient colors={['transparent', 'rgba(31, 74, 115, 0.75)']} style={styles.mediaShade}>
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
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={17} color={isSaved ? '#6E42E1' : '#655A88'} />
            <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{listing.kind}</Text>
          <Text style={styles.metaText}>{listing.priceType}</Text>
          <Text style={styles.metaText}>Live</Text>
        </View>
        <View style={styles.campusRow}>
          <Ionicons name="location-outline" size={15} color="#6E42E1" />
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
    backgroundColor: '#FEFEFE',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(155, 92, 255, 0.3)',
    shadowColor: '#744BDC',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  loadingLogo: {
    width: 112,
    height: 112,
  },
  loadingTitle: {
    color: '#ffffff',
    fontFamily: 'sans-serif-rounded',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 1,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  authShell: {
    flex: 1,
  },
  authScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 36,
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
    color: '#241150',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  authPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 22,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(110, 66, 225, 0.12)',
    shadowColor: '#6E42E1',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 330,
    backgroundColor: 'rgba(110, 66, 225, 0.08)',
    borderRadius: 16,
    padding: 5,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  segmentButtonActive: {
    backgroundColor: '#6E42E1',
  },
  segmentText: {
    color: '#4D2EB7',
    fontWeight: '800',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(110, 66, 225, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#241150',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(110, 66, 225, 0.15)',
  },
  googleButtonText: {
    color: '#1F4A73',
    fontWeight: '900',
  },
  troubleText: {
    color: '#744BDC',
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
    backgroundColor: 'rgba(110, 66, 225, 0.12)',
  },
  dividerText: {
    color: '#744BDC',
    fontWeight: '900',
    fontSize: 12,
  },
  formLabel: {
    color: '#4D2EB7',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  underlinedInput: {
    backgroundColor: '#F4F1FE',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#241150',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 12,
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(110, 66, 225, 0.25)',
    paddingVertical: 10,
  },
  pickerFieldText: {
    color: '#241150',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerFieldPlaceholder: {
    color: '#744BDC',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 74, 115, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#F4F1FE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  pickerHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(110, 66, 225, 0.25)',
    marginBottom: 14,
  },
  pickerSheetTitle: {
    color: '#1F4A73',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(110, 66, 225, 0.05)',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(110, 66, 225, 0.08)',
    borderWidth: 1,
    borderColor: '#6E42E1',
  },
  pickerOptionText: {
    color: '#4D2EB7',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerOptionTextSelected: {
    color: '#1F4A73',
    fontWeight: '900',
  },
  forgotLink: {
    color: '#6E42E1',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },
  authMessage: {
    color: '#6E42E1',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
  },
  authHint: {
    color: '#9B68F4',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '900',
    marginTop: 8,
  },
  authSubmitButton: {
    backgroundColor: '#6E42E1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6E42E1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  authSubmitText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
  authSwitchText: {
    color: '#744BDC',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 2,
  },
  signupHint: {
    color: '#4D2EB7',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 3,
  },
  flowHeader: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(110, 66, 225, 0.12)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  flowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(110, 66, 225, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowHeaderText: {
    flex: 1,
  },
  flowTitle: {
    color: '#1F4A73',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 3,
  },
  flowCopy: {
    color: '#4D2EB7',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  evidenceButton: {
    borderWidth: 1,
    borderColor: 'rgba(110, 66, 225, 0.15)',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  evidenceButtonReady: {
    backgroundColor: '#6E42E1',
    borderColor: '#6E42E1',
  },
  evidenceText: {
    color: '#6E42E1',
    fontWeight: '900',
  },
  evidenceTextReady: {
    color: '#ffffff',
  },
  verificationNote: {
    backgroundColor: 'rgba(110, 66, 225, 0.06)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  verificationText: {
    flex: 1,
    color: '#4D2EB7',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  demoBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(110, 66, 225, 0.12)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  demoTitle: {
    color: '#1F4A73',
    fontWeight: '900',
    marginBottom: 6,
  },
  demoLine: {
    color: '#4D2EB7',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#6E42E1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#6E42E1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
  linkText: {
    color: '#5B38C9',
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 2,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 132,
  },
  topCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  brandTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  smallLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profilePill: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#F4F1FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
  },
  profileInitial: {
    color: '#5B38C9',
    fontWeight: '900',
  },
  heroLine: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
    marginTop: 18,
  },
  needRow: {
    marginTop: 14,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  needChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needChipActive: {
    backgroundColor: '#6E42E1',
    borderColor: '#6E42E1',
  },
  needChipText: {
    color: '#655A88',
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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  quickActionRow: {
    marginTop: 14,
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionButtonText: {
    color: '#5B38C9',
    fontWeight: '900',
  },
  vendorHeroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  mostOrderedRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mostOrderedCard: {
    width: 188,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  mostOrderedImage: {
    width: '100%',
    height: 120,
  },
  mostOrderedBody: {
    padding: 12,
  },
  mostOrderedRating: {
    color: '#5B38C9',
    fontWeight: '900',
    marginBottom: 6,
  },
  mostOrderedTitle: {
    color: '#241150',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  mostOrderedVendor: {
    color: '#655A88',
    fontSize: 12,
    fontWeight: '800',
  },
  addPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    backgroundColor: '#6E42E1',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBannerContainer: {
    marginBottom: 18,
  },
  promoBanner: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 170,
    justifyContent: 'flex-end',
  },
  promoBannerImageStyle: {
    borderRadius: 12,
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
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 14,
  },
  promoButton: {
    backgroundColor: '#5B38C9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  whatsForLunchRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lunchCard: {
    width: 170,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
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
    color: '#241150',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4,
  },
  lunchVendor: {
    color: '#655A88',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  lunchPrice: {
    color: '#5B38C9',
    fontWeight: '900',
  },
  vendorHeroStat: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  vendorHeroValue: {
    color: '#241150',
    fontSize: 18,
    fontWeight: '900',
  },
  vendorHeroLabel: {
    color: '#655A88',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 3,
  },
  vendorRevenueCard: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    minHeight: 134,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
  },
  revenueLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
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
    color: '#EDE7FB',
    fontWeight: '800',
    marginTop: 7,
  },
  revenueIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(110, 66, 225, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconPurple: {
    backgroundColor: 'rgba(155, 92, 255, 0.15)',
  },
  metricIconAmber: {
    backgroundColor: 'rgba(31, 74, 115, 0.1)',
  },
  metricValue: {
    color: '#241150',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  metricLabel: {
    color: '#655A88',
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
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  vendorActionText: {
    flex: 1,
    color: '#241150',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  statValue: {
    color: '#241150',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  statLabel: {
    color: '#655A88',
    fontWeight: '800',
    marginTop: 3,
  },
  orderRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(155, 92, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    color: '#241150',
    fontWeight: '900',
  },
  orderStatus: {
    color: '#5B38C9',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
  },
  messageTag: {
    backgroundColor: 'rgba(155, 92, 255, 0.15)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  messageTagText: {
    color: '#655A88',
    fontSize: 11,
    fontWeight: '900',
  },
  ruleBox: {
    backgroundColor: 'rgba(155, 92, 255, 0.1)',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    marginBottom: 12,
  },
  ruleText: {
    flex: 1,
    color: '#655A88',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  catalogAddButton: {
    backgroundColor: '#6E42E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    color: '#655A88',
    fontWeight: '800',
    marginTop: -6,
    marginBottom: 12,
  },
  vendorProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
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
    backgroundColor: '#F4F1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorProductThumb: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F4F1FE',
  },
  vendorProductPrice: {
    color: '#5B38C9',
    fontWeight: '900',
    flexShrink: 0,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4F1FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  backButtonText: {
    color: '#6E42E1',
    fontWeight: '900',
  },
  vendorPageHero: {
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  vendorPageImage: {
    borderRadius: 16,
  },
  vendorPageShade: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  vendorPageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6E42E1',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  vendorPageBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  vendorPageTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  vendorPageCopy: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '900',
    marginTop: 6,
  },
  vendorInfoCard: {
    backgroundColor: '#F4F1FE',
    padding: 10,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#6E42E1',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vendorInfoRow: {
    minHeight: 40,
    flexBasis: '31%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
  },
  vendorInfoText: {
    flexShrink: 1,
    color: '#241150',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'center',
  },
  profileModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(5,3,10,0.85)' },
  profileCard: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 0, elevation: 8, shadowColor: '#6E42E1', shadowOpacity: 0.14, shadowRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(155, 92, 255, 0.25)' },
  profileHeader: { padding: 18, backgroundColor: '#F4F1FE', flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(155, 92, 255, 0.2)' },
  profileNameText: { color: '#241150', fontWeight: '900', fontSize: 18 },
  profileSubText: { color: '#655A88', fontSize: 13 },
  profileBody: { padding: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  profileLabel: { color: '#655A88', fontWeight: '700', fontSize: 13 },
  profileValue: { color: '#241150', fontWeight: '800', fontSize: 14 },
  profileActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  editorInput: { borderWidth: 1, borderColor: 'rgba(155, 92, 255, 0.2)', borderRadius: 12, padding: 10, marginTop: 6, marginBottom: 12, backgroundColor: '#F4F1FE', color: '#241150' },
  vendorListingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  vendorListingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorListingDescription: {
    color: '#655A88',
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
    backgroundColor: '#6E42E1',
    borderRadius: 12,
    paddingVertical: 12,
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
    backgroundColor: '#F4F1FE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.3)',
  },
  bargainButtonDisabled: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(155, 92, 255, 0.1)',
  },
  bargainButtonText: {
    color: '#5B38C9',
    fontWeight: '900',
  },
  bargainButtonTextDisabled: {
    color: '#B3A8CE',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#241150',
    fontSize: 16,
    fontWeight: '700',
  },
  categoryRow: {
    marginVertical: 16,
  },
  categoryChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(91, 56, 201, 0.14)',
    borderColor: '#5B38C9',
  },
  categoryChipText: {
    color: '#655A88',
    fontWeight: '900',
  },
  categoryChipTextActive: {
    color: '#5B38C9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#241150',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionMeta: {
    color: '#655A88',
    fontWeight: '800',
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
  },
  listingMedia: {
    height: 158,
  },
  listingImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mediaShade: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  priceTag: {
    margin: 10,
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#241150',
    fontSize: 19,
    fontWeight: '900',
  },
  vendorName: {
    color: '#655A88',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  saveButton: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  saveButtonActive: {
    backgroundColor: 'rgba(110, 66, 225, 0.12)',
    borderColor: '#6E42E1',
  },
  saveButtonText: {
    color: '#655A88',
    fontWeight: '900',
  },
  saveButtonTextActive: {
    color: '#6E42E1',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaText: {
    minHeight: 28,
    backgroundColor: 'rgba(155, 92, 255, 0.15)',
    color: '#655A88',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  campusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  campusText: {
    color: '#655A88',
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    minHeight: 28,
    color: '#6E42E1',
    backgroundColor: '#F4F1FE',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  detailPanel: {
    borderRadius: 12,
    padding: 18,
    marginTop: 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
  },
  detailTitle: {
    color: '#241150',
    fontSize: 20,
    fontWeight: '900',
  },
  detailPanelTitle: {
    color: '#241150',
    fontSize: 21,
    fontWeight: '900',
  },
  detailVendor: {
    color: '#6E42E1',
    fontWeight: '900',
    marginTop: 6,
  },
  detailPanelCopy: {
    color: '#241150',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  detailCopy: {
    color: '#655A88',
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
    backgroundColor: '#6E42E1',
    borderRadius: 12,
    paddingVertical: 12,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5B38C9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  lightButtonText: {
    color: '#5B38C9',
    fontWeight: '900',
  },
  reelFeed: {
    paddingBottom: 16,
  },
  reelCard: {
    minHeight: 500,
    aspectRatio: 9 / 15,
    marginBottom: 18,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  reelImage: {
    borderRadius: 12,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subscribeButtonActive: {
    backgroundColor: '#6E42E1',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  subscribeButtonTextActive: {
    color: '#ffffff',
  },
  reelBottomRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reelMusicText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    flex: 1,
  },
  reelCommentText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  reelBadge: {
    color: '#ffffff',
    backgroundColor: 'rgba(110, 66, 225, 0.92)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontWeight: '900',
  },
  reelIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(27, 16, 53, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelTitle: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '900',
  },
  reelVendor: {
    color: '#5B38C9',
    fontWeight: '900',
    marginTop: 6,
  },
  reelCaption: {
    color: '#ffffff',
    lineHeight: 21,
    marginTop: 8,
  },
  chatRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
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
    minWidth: 0,
  },
  chatName: {
    color: '#241150',
    fontWeight: '900',
    fontSize: 16,
  },
  chatLast: {
    color: '#655A88',
    marginTop: 4,
    lineHeight: 19,
  },
  chatPrivacyNotice: {
    backgroundColor: 'rgba(155, 92, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chatPrivacyText: {
    flex: 1,
    color: '#655A88',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  threadChipActive: {
    backgroundColor: '#744BDC',
    borderColor: '#744BDC',
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
    color: '#241150',
    fontWeight: '900',
  },
  threadChipNameActive: {
    color: '#ffffff',
  },
  threadChipStatus: {
    color: '#655A88',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  threadChipStatusActive: {
    color: '#ffffff',
  },
  chatPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
  },
  chatPanelHeader: {
    backgroundColor: '#F4F1FE',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 92, 255, 0.2)',
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
    color: '#241150',
    fontWeight: '900',
    fontSize: 17,
  },
  chatPanelSubtitle: {
    color: '#655A88',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  chatHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  emptyChatState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
  },
  dayPill: {
    alignSelf: 'center',
    backgroundColor: '#F4F1FE',
    color: '#655A88',
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
    backgroundColor: '#F4F1FE',
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.15)',
  },
  messageBubbleMine: {
    backgroundColor: '#6E42E1',
    borderTopRightRadius: 6,
  },
  messageText: {
    color: '#241150',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  messageTextMine: {
    color: '#ffffff',
  },
  messageTime: {
    color: '#655A88',
    fontSize: 10,
    fontWeight: '900',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  messageTimeMine: {
    color: '#EDE7FB',
  },
  composerRow: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 92, 255, 0.25)',
  },
  composerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 96,
    borderRadius: 19,
    backgroundColor: '#F4F1FE',
    color: '#241150',
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontWeight: '700',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6E42E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonMuted: {
    backgroundColor: 'rgba(110, 66, 225, 0.4)',
  },
  unreadBadge: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#6E42E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  negotiationBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
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
    backgroundColor: '#F4F1FE',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  offerChipText: {
    color: '#5B38C9',
    fontWeight: '900',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  emptyTitle: {
    color: '#241150',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  emptyCopy: {
    color: '#655A88',
    marginTop: 8,
    textAlign: 'center',
  },
  studioHero: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 14,
  },
  addListingPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    gap: 12,
    marginBottom: 14,
  },
  kindSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F4F1FE',
    borderRadius: 16,
    padding: 5,
  },
  kindButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  kindButtonActive: {
    backgroundColor: '#6E42E1',
  },
  kindButtonText: {
    color: '#655A88',
    fontWeight: '900',
  },
  kindButtonTextActive: {
    color: '#ffffff',
  },
  photoUploadBox: {
    minHeight: 170,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.3)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#F4F1FE',
  },
  photoUploadEmpty: {
    flex: 1,
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  photoUploadTitle: {
    color: '#241150',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },
  photoUploadCopy: {
    color: '#655A88',
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
    backgroundColor: '#6E42E1',
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
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginTop: 10,
  },
  studioAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
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
    color: '#241150',
    fontSize: 16,
    fontWeight: '900',
  },
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  exploreTile: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    justifyContent: 'space-between',
  },
  exploreIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreTitle: {
    color: '#241150',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12,
  },
  exploreSubtitle: {
    color: '#655A88',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    marginTop: 4,
  },
  discoveryRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discoveryImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F4F1FE',
  },
  discoveryPrice: {
    color: '#5B38C9',
    fontWeight: '900',
    flexShrink: 0,
  },
  orderSummaryBand: {
    backgroundColor: '#1F4A73',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  orderSummaryLabel: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  orderSummaryValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
    marginTop: 5,
  },
  buyerOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  buyerOrderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTrack: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  statusDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E7E1F5',
  },
  statusDotActive: {
    backgroundColor: '#6E42E1',
  },
  orderNext: {
    color: '#655A88',
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 10,
  },
  orderChatButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F4F1FE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.22)',
  },
  orderChatButtonText: {
    color: '#6E42E1',
    fontWeight: '900',
  },
  profileScreenHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileScreenAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileScreenInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileScreenName: {
    color: '#241150',
    fontSize: 18,
    fontWeight: '900',
  },
  profileScreenEmail: {
    color: '#655A88',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  profileEditButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F1FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 16,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  profileStatValue: {
    color: '#241150',
    fontSize: 21,
    fontWeight: '900',
  },
  profileStatLabel: {
    color: '#655A88',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  historyRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 7,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.25)',
    shadowColor: '#744BDC',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 9,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 6,
    gap: 3,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(110, 66, 225, 0.12)',
    borderWidth: 1,
    borderColor: '#6E42E1',
  },
  tabText: {
    color: '#655A88',
    fontSize: 9,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#6E42E1',
  },
  
  // Customer Profile Styles
  profileReadOnlySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    alignItems: 'center',
  },
  profilePhotoLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F4F1FE',
  },
  profilePhotoImage: {
    width: '100%',
    height: '100%',
  },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F1FE',
  },
  profileHeaderInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profileFullName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#241150',
  },
  profileInstitution: {
    fontSize: 13,
    color: '#655A88',
    fontWeight: '600',
  },
  profileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.1)',
  },
  profileStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6E42E1',
    marginBottom: 2,
  },
  profileStatLabel: {
    fontSize: 11,
    color: '#655A88',
    fontWeight: '600',
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(155, 92, 255, 0.15)',
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  profileMetaText: {
    fontSize: 12,
    color: '#655A88',
    fontWeight: '600',
  },
  profileTrustBadgeContainer: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trustBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trustBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  trustBadgeSubtext: {
    position: 'absolute',
    bottom: 4,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    right: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6E42E1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
  },
  editProfileButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  profileEditablePreview: {
    backgroundColor: '#F4F1FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
  },
  profileSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#241150',
    marginBottom: 12,
  },
  profileInfoItem: {
    marginBottom: 12,
  },
  profileInfoLabel: {
    fontSize: 11,
    color: '#655A88',
    fontWeight: '700',
    marginBottom: 3,
  },
  profileInfoValue: {
    fontSize: 13,
    color: '#241150',
    fontWeight: '600',
  },
  profileInfoDescription: {
    fontSize: 11,
    color: '#9A8CBF',
    fontWeight: '500',
  },
  profileNotificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileEditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F4F1FE',
    borderRadius: 10,
  },
  profileEditTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#241150',
  },
  profilePhotoEditBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F4F1FE',
    borderWidth: 2,
    borderColor: '#6E42E1',
    alignSelf: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePhotoImageEdit: {
    width: '100%',
    height: '100%',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6E42E1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileEditSection: {
    marginBottom: 16,
  },
  editFieldGroup: {
    marginBottom: 16,
  },
  editFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#241150',
    marginBottom: 6,
  },
  editFieldDescription: {
    fontSize: 11,
    color: '#9A8CBF',
    fontWeight: '500',
    marginTop: 2,
  },
  editFieldInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(155, 92, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#241150',
    fontWeight: '600',
  },
  notificationToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E2F7',
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  toggleSwitchActive: {
    backgroundColor: '#6E42E1',
    justifyContent: 'flex-end',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleCircleActive: {
    backgroundColor: '#ffffff',
  },
  savProfileButton: {
    backgroundColor: '#6E42E1',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  savProfileButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});





