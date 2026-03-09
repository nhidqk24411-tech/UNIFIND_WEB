
import { FoundItem, ItemCategory, UserProfile, ItemType, ItemStatus, Report, SystemLog, GuidancePost, ChatSession, Message } from './types';

// --- MOCK USERS ---

export const USERS_DB: UserProfile[] = [
    {
        id: 'user-giang',
        name: 'Giang N.N',
        email: 'giangnntk24411@st.uel.edu.vn',
        phone: '0912345678',
        studentId: 'K244111398',
        avatarUrl: 'https://ui-avatars.com/api/?name=Giang+NN&background=random',
        joinedDate: '2023-09-01T00:00:00.000Z',
        role: 'USER',
        isLocked: false,
        isVerified: true
    },
    {
        id: 'user-nhi',
        name: 'Nhi D.Q',
        email: 'nhidqk24411@st.uel.edu.vn',
        phone: '0987654321',
        studentId: 'K244111421',
        avatarUrl: 'https://ui-avatars.com/api/?name=Nhi+DQ&background=0D8ABC&color=fff',
        joinedDate: '2023-08-15T00:00:00.000Z',
        role: 'ADMIN',
        isLocked: false,
        isVerified: true
    },
    {
        id: 'user-new',
        name: 'Nguyen Van New',
        email: 'newk24@st.uel.edu.vn',
        phone: '0909090909',
        studentId: 'K24000000',
        avatarUrl: 'https://ui-avatars.com/api/?name=New+User&background=random',
        joinedDate: '2024-01-01T00:00:00.000Z',
        role: 'USER',
        isLocked: false,
        isVerified: false // Testing First Login Flow
    }
];

export const CURRENT_USER: UserProfile = USERS_DB[0]; // Default fallback, but app will start at Login

// --- DATA GENERATION HELPERS ---

const LOCATIONS = [
  "Library, 3rd Floor", "Student Union", "Gym Locker Room", "Cafeteria", 
  "Science Building Hallway", "Parking Lot B", "Dormitory Common Area", 
  "Lecture Hall 101", "Main Quad", "Bus Stop near Gate A", 
  "Engineering Lab", "Coffee Shop"
];

const ITEM_TEMPLATES = [
  { title: "iPhone 13 Case", cat: ItemCategory.ELECTRONICS, desc: "Black silicone case, phone not inside." },
  { title: "AirPods Pro", cat: ItemCategory.ELECTRONICS, desc: "Found in a white case with a puppy sticker." },
  { title: "Dell Laptop Charger", cat: ItemCategory.ELECTRONICS, desc: "Standard 65W charger, left near an outlet." },
  { title: "Blue Hydro Flask", cat: ItemCategory.ACCESSORIES, desc: "32oz bottle, dented on the bottom." },
  { title: "RayBan Sunglasses", cat: ItemCategory.ACCESSORIES, desc: "Aviator style, gold frame." },
  { title: "Nike Hoodie", cat: ItemCategory.CLOTHING, desc: "Size M, Grey, found on a chair." },
  { title: "Denim Jacket", cat: ItemCategory.CLOTHING, desc: "Vintage look, has a pin on the collar." },
  { title: "Calculus Textbook", cat: ItemCategory.BOOKS, desc: "Early Transcendentals, 8th Edition." },
  { title: "Spiral Notebook", cat: ItemCategory.BOOKS, desc: "Red cover, says 'Chemistry Notes'." },
  { title: "Student ID Card", cat: ItemCategory.ID_CARDS, desc: "Belongs to a Sophomore from Arts dept." },
  { title: "Car Keys (Toyota)", cat: ItemCategory.OTHER, desc: "Key fob with a lanyard." },
  { title: "Umbrella", cat: ItemCategory.OTHER, desc: "Black compact umbrella." },
  { title: "Scientific Calculator", cat: ItemCategory.ELECTRONICS, desc: "TI-84 Plus, has name written on back." },
  { title: "Wool Scarf", cat: ItemCategory.CLOTHING, desc: "Red and plaid pattern." },
  { title: "Wallet", cat: ItemCategory.ID_CARDS, desc: "Brown leather wallet, contains no cash." }
];

const FINDER_NAMES = ["Sarah J.", "Mike R.", "Emily W.", "David K.", "Jessica T.", "Chris P.", "Amanda L.", "Security Office"];

const generateMockItems = (count: number): FoundItem[] => {
  const items: FoundItem[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const isLost = Math.random() > 0.5; 
    const type: ItemType = isLost ? 'LOST' : 'FOUND';
    const template = ITEM_TEMPLATES[Math.floor(Math.random() * ITEM_TEMPLATES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    const daysAgo = Math.floor(Math.random() * 60);
    const dateFound = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    const userId = `user-${Math.floor(Math.random() * 100) + 2}`;

    // Randomize status for demo purposes including COMPLETED and EXPIRED
    let status: ItemStatus = 'PUBLISHED';
    const rand = Math.random();
    
    if (i < 5) status = 'COMPLETED'; // Force first 5 to be completed for visibility
    else if (i < 10) status = 'EXPIRED'; // Force next 5 to be expired/not processed
    else if (rand < 0.1) status = 'PENDING';
    else if (rand < 0.15) status = 'REJECTED';

    items.push({
      id: `mock-${i + 1}`,
      userId: userId,
      type: type,
      title: template.title,
      description: `${isLost ? 'Lost' : 'Found'} somewhere in ${location}. ${template.desc}`,
      location: location,
      dateFound: dateFound,
      imageUrl: `https://picsum.photos/seed/item${i}/400/300`, 
      contactInfo: `student${i}@st.uel.edu.vn`,
      category: template.cat,
      finderName: FINDER_NAMES[Math.floor(Math.random() * FINDER_NAMES.length)],
      status: status
    });
  }
  return items.sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime());
};

export const MOCK_ITEMS: FoundItem[] = generateMockItems(50);
export const CATEGORIES = Object.values(ItemCategory);

// --- MOCK ADMIN DATA ---

export const MOCK_REPORTS: Report[] = [
    { id: 'r1', type: 'ITEM', reporterId: 'user-giang', targetId: 'mock-1', reason: 'Spam/Fake Item', details: 'This item looks like a stock photo, not real.', status: 'PENDING', timestamp: new Date().toISOString() },
    { id: 'r2', type: 'USER', reporterId: 'user-nhi', targetId: 'user-new', reason: 'Abusive language', details: 'User used profanity in comments.', status: 'RESOLVED', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'r3', type: 'ITEM', reporterId: 'user-new', targetId: 'mock-2', targetName: 'AirPods Pro', reason: 'Already Found', details: 'I saw the owner pick this up yesterday.', status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'r4', type: 'USER', reporterId: 'user-giang', targetId: 'user-unknown', targetName: 'Unknown User', reason: 'Scam Attempt', details: 'Asked for money to return my ID card.', status: 'PENDING', timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export const MOCK_FEEDBACKS: Message[] = [
    { id: 'fb1', senderId: 'user-giang', text: 'Ứng dụng rất hữu ích, cảm ơn BQL!', timestamp: Date.now() - 10000000 },
    { id: 'fb2', senderId: 'user-new', text: 'Giao diện trên điện thoại hơi khó bấm nút filter.', timestamp: Date.now() - 5000000 },
    { id: 'fb3', senderId: 'user-anon', text: 'Nên thêm tính năng thông báo qua Zalo.', timestamp: Date.now() - 100000 },
];

export const MOCK_GUIDANCE: GuidancePost[] = [
    { id: 'g1', title: 'How to report a lost item', content: 'Click the "Lost" button, fill in details, upload a photo...', lastUpdated: '2024-01-10' },
    { id: 'g2', title: 'Safety tips when meeting', content: 'Always meet in public places like the Student Union...', lastUpdated: '2024-02-15' },
];

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
    {
        id: 'chat-1',
        itemId: 'mock-3',
        participants: ['user-giang', 'user-finder-1'],
        messages: [
            { id: 'm1', senderId: 'user-giang', text: 'Chào bạn, mình nghĩ cái ví đó là của mình.', timestamp: Date.now() - 1000000 },
            { id: 'm2', senderId: 'user-finder-1', text: 'Bạn mô tả giúp mình bên trong có gì không?', timestamp: Date.now() - 900000 },
            { id: 'm3', senderId: 'user-giang', text: 'Có thẻ sinh viên tên Giang và 50k.', timestamp: Date.now() - 800000 },
            { id: 'm4', senderId: 'user-finder-1', text: 'Đúng rồi! Hẹn gặp ở thư viện nhé.', timestamp: Date.now() - 700000 },
        ],
        lastUpdated: Date.now() - 700000,
        otherUserName: 'Nguyen Van A',
        itemTitle: 'Wallet (Black)',
        itemImage: 'https://picsum.photos/seed/item3/100/100',
        returnConfirmedBy: []
    },
    {
        id: 'chat-2',
        itemId: 'mock-5',
        participants: ['user-new', 'user-scammer'],
        messages: [
            { id: 'm1', senderId: 'user-scammer', text: 'Mình nhặt được laptop của bạn nè.', timestamp: Date.now() - 500000 },
            { id: 'm2', senderId: 'user-scammer', text: 'Chuyển trước 200k phí cafe mình mang qua cho.', timestamp: Date.now() - 400000 },
            { id: 'm3', senderId: 'user-new', text: 'Gặp trực tiếp rồi mình gửi nhé?', timestamp: Date.now() - 300000 },
            { id: 'm4', senderId: 'user-scammer', text: 'Không, chuyển trước mới đi. STK: 123456...', timestamp: Date.now() - 200000 },
        ],
        lastUpdated: Date.now() - 200000,
        otherUserName: 'Suspicious User',
        itemTitle: 'MacBook Pro',
        itemImage: 'https://picsum.photos/seed/item5/100/100',
        returnConfirmedBy: []
    }
];
