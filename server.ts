import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './server/db.js';
import {
  hashPassword,
  verifyPassword,
  signAdminToken,
  signMemberToken,
  requireAdminAuth,
  requireMemberAuth,
  ensureDefaultAdmin,
  AuthenticatedAdminRequest,
  AuthenticatedMemberRequest,
} from './server/auth.js';
import { uploadMiddleware, ensureDefaultAssets } from './server/upload.js';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure directories and default assets
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
ensureDefaultAssets();
ensureDefaultAdmin().catch(err => console.error('Error in ensureDefaultAdmin:', err));

// Serve uploaded and static files
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/default-assets', express.static(path.join(process.cwd(), 'public', 'default-assets')));

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Organization Public Settings
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to retrieve organization settings.' });
  }
});

// Active Homepage Slides
app.get('/api/slides', async (_req: Request, res: Response) => {
  try {
    const allSlides = await db.getSlides();
    const active = allSlides.filter(s => s.is_active);
    res.json(active);
  } catch (err) {
    console.error('Error fetching slides:', err);
    res.status(500).json({ error: 'Failed to retrieve slides.' });
  }
});

// Public History & Inspiration Sections
app.get('/api/history', async (_req: Request, res: Response) => {
  try {
    const sections = db.getHistorySections(true); // only published
    res.json(sections);
  } catch (err) {
    console.error('Error fetching history sections:', err);
    res.status(500).json({ error: 'Failed to retrieve history sections.' });
  }
});

app.get('/api/history/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const section = db.getHistorySectionBySlug(slug);
    if (!section) {
      return res.status(404).json({ error: 'History section not found.' });
    }
    res.json(section);
  } catch (err) {
    console.error('Error fetching history section by slug:', err);
    res.status(500).json({ error: 'Failed to retrieve history section.' });
  }
});

// Public Posts & News (Published only)
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const { category, limit } = req.query;
    let posts = db.getPosts(true, typeof category === 'string' ? category : undefined);
    if (limit) {
      const parsedLimit = parseInt(String(limit), 10);
      if (parsedLimit > 0) {
        posts = posts.slice(0, parsedLimit);
      }
    }
    res.json(posts);
  } catch (err) {
    console.error('Error fetching public posts:', err);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

app.get('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = db.getPostById(id);
    if (!post || post.status !== 'published') {
      return res.status(404).json({ error: 'Post not found or not published.' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    res.status(500).json({ error: 'Failed to retrieve post.' });
  }
});

// Secure File Upload endpoint (Member photo, admin assets)
app.post('/api/upload', (req: Request, res: Response) => {
  uploadMiddleware.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file was provided.' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: publicUrl, filename: req.file.filename });
  });
});

// Member Registration (Free membership)
app.post('/api/members/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      father_name,
      mobile,
      address,
      district,
      state,
      photo_url,
      role,
    } = req.body;

    // Strict validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Full Name is required (minimum 2 characters).' });
    }
    if (!father_name || typeof father_name !== 'string' || father_name.trim().length < 2) {
      return res.status(400).json({ error: "Father's Name is required." });
    }
    if (!mobile || typeof mobile !== 'string') {
      return res.status(400).json({ error: 'Valid mobile number is required.' });
    }

    // Validate Indian mobile number (10 digits)
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return res.status(400).json({ error: 'Full address is required (minimum 5 characters).' });
    }
    if (!district || typeof district !== 'string' || district.trim().length < 2) {
      return res.status(400).json({ error: 'District is required.' });
    }
    if (!state || typeof state !== 'string' || state.trim().length < 2) {
      return res.status(400).json({ error: 'State is required.' });
    }

    const ALLOWED_ROLES = ['Social Worker', 'Sahayak', 'Adhyaksh'];
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected. Must be Social Worker, Sahayak, or Adhyaksh.' });
    }

    // Check if mobile already registered
    const existing = await db.getMemberByMobile(cleanMobile);
    if (existing) {
      return res.status(409).json({
        error: `A membership is already registered with mobile number ${cleanMobile}. Your Membership ID is ${existing.membership_id}. You can log in using your credentials.`,
        existingMembershipId: existing.membership_id,
      });
    }

    const safePhotoUrl = photo_url && typeof photo_url === 'string' && photo_url.trim().length > 0
      ? photo_url.trim()
      : '/default-assets/logo.svg';

    const member = await db.createMember({
      name: name.trim(),
      father_name: father_name.trim(),
      mobile: cleanMobile,
      address: address.trim(),
      district: district.trim(),
      state: state.trim(),
      photo_url: safePhotoUrl,
      role: role as 'Social Worker' | 'Sahayak' | 'Adhyaksh',
      rejection_reason: null,
      approved_at: null,
      rejected_at: null,
    });

    res.status(201).json({
      success: true,
      message: 'Registration Successful',
      membershipId: member.membership_id,
      member: {
        id: member.id,
        membership_id: member.membership_id,
        name: member.name,
        father_name: member.father_name,
        mobile: member.mobile,
        district: member.district,
        state: member.state,
        role: member.role,
        status: member.status,
        created_at: member.created_at,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  }
});

// Member Login (Mobile Number + Membership ID)
app.post('/api/members/login', async (req: Request, res: Response) => {
  try {
    const { mobile, membershipId } = req.body;

    if (!mobile || !membershipId) {
      return res.status(400).json({ error: 'Both Mobile Number and Membership ID are required.' });
    }

    const member = await db.authenticateMember(mobile, membershipId);
    if (!member) {
      return res.status(401).json({ error: 'Invalid mobile number or membership ID.' });
    }

    const token = signMemberToken({
      memberId: member.id,
      membershipId: member.membership_id,
      mobile: member.mobile,
    });

    res.json({
      success: true,
      token,
      member: {
        id: member.id,
        membership_id: member.membership_id,
        name: member.name,
        father_name: member.father_name,
        mobile: member.mobile,
        address: member.address,
        district: member.district,
        state: member.state,
        photo_url: member.photo_url,
        role: member.role,
        status: member.status,
        rejection_reason: member.rejection_reason,
        created_at: member.created_at,
        approved_at: member.approved_at,
      },
    });
  } catch (err) {
    console.error('Member login error:', err);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// Public Membership Verification: /verify/:membershipId
app.get('/api/verify/:membershipId', async (req: Request, res: Response) => {
  try {
    const { membershipId } = req.params;
    if (!membershipId) {
      return res.status(400).json({ error: 'Membership ID parameter missing.' });
    }

    const member = await db.getMemberByMembershipId(membershipId);
    if (!member) {
      return res.status(404).json({ error: 'Invalid Membership ID. No verified member found.' });
    }

    const settings = await db.getSettings();

    // Public sanitized representation - Never reveals passwords, admin details, or private authentication data
    res.json({
      success: true,
      org_name: settings.org_name,
      org_name_hindi: settings.org_name_hindi,
      member: {
        membership_id: member.membership_id,
        name: member.name,
        role: member.role,
        district: member.district,
        state: member.state,
        photo_url: member.photo_url,
        status: member.status,
        created_at: member.created_at,
        approved_at: member.approved_at,
        validity: `${settings.id_card_validity_years} Years (Active Life Member)`,
      },
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'An error occurred during verification.' });
  }
});

// ==========================================
// PROTECTED MEMBER API ROUTES
// ==========================================

// Get logged-in member's profile & settings for ID card
app.get('/api/member/me', requireMemberAuth, async (req: AuthenticatedMemberRequest, res: Response) => {
  try {
    if (!req.memberAuth) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const member = await db.getMemberById(req.memberAuth.memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const settings = await db.getSettings();

    res.json({
      member,
      settings: {
        org_name: settings.org_name,
        org_name_hindi: settings.org_name_hindi,
        logo_url: settings.logo_url,
        authorized_person_name: settings.authorized_person_name,
        authorized_person_designation: settings.authorized_person_designation,
        signature_url: settings.signature_url,
        id_card_validity_years: settings.id_card_validity_years,
        registration_year: settings.registration_year,
      },
    });
  } catch (err) {
    console.error('Error fetching member profile:', err);
    res.status(500).json({ error: 'Failed to fetch member details.' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION & MANAGEMENT
// ==========================================

// Check if any admin exists (for first-time setup)
app.get('/api/admin/status', (_req: Request, res: Response) => {
  res.json({
    hasAdmin: db.hasAnyAdmin(),
  });
});

// First-time admin setup (Only allowed when no admin exists in the database)
app.post('/api/admin/setup', async (req: Request, res: Response) => {
  try {
    if (db.hasAnyAdmin()) {
      return res.status(403).json({ error: 'Admin account already initialized. Please login.' });
    }

    const { username, password, name, email } = req.body;
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const hash = await hashPassword(password);
    const admin = await db.createAdmin({
      username: username.trim(),
      password_hash: hash,
      name: name?.trim() || 'Administrator',
      email: email?.trim() || 'admin@paswanektamanch.org',
      role: 'SUPER_ADMIN',
    });

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: 'SUPER_ADMIN',
    });

    res.status(201).json({
      success: true,
      message: 'Master Administrator created successfully.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error('Admin setup error:', err);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await db.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const match = await verifyPassword(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: 'SUPER_ADMIN',
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// ==========================================
// PROTECTED ADMIN API ROUTES
// ==========================================

// Dashboard Statistics
app.get('/api/admin/dashboard-stats', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const members = await db.getMembers();
    const total = members.length;
    const pending = members.filter(m => m.status === 'PENDING').length;
    const approved = members.filter(m => m.status === 'APPROVED').length;
    const rejected = members.filter(m => m.status === 'REJECTED').length;

    // Counts by role
    const roleStats = {
      socialWorker: members.filter(m => m.role === 'Social Worker').length,
      sahayak: members.filter(m => m.role === 'Sahayak').length,
      adhyaksh: members.filter(m => m.role === 'Adhyaksh').length,
    };

    // Recent 5 members
    const recent = members.slice(0, 5);

    const allPosts = db.getPosts(false);
    const total_posts = allPosts.length;
    const published_posts = allPosts.filter(p => p.status === 'published').length;
    const draft_posts = allPosts.filter(p => p.status === 'draft').length;

    res.json({
      total,
      pending,
      approved,
      rejected,
      total_posts,
      published_posts,
      draft_posts,
      roleStats,
      recent,
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// Member Management: List, Search, Filter, Pagination
app.get('/api/admin/members', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { search, status, role, district, page = '1', limit = '15' } = req.query;

    let members = await db.getMembers();

    // Filters
    if (status && typeof status === 'string' && status !== 'ALL') {
      members = members.filter(m => m.status.toUpperCase() === status.toUpperCase());
    }

    if (role && typeof role === 'string' && role !== 'ALL') {
      members = members.filter(m => m.role.toLowerCase() === role.toLowerCase());
    }

    if (district && typeof district === 'string' && district !== 'ALL') {
      members = members.filter(m => m.district.toLowerCase().includes(district.toLowerCase()));
    }

    // Search query: Name, Mobile, Membership ID, District
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      members = members.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.membership_id.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.father_name.toLowerCase().includes(q)
      );
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 15));
    const totalCount = members.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginated = members.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    // Get unique list of districts for the filter dropdown
    const allDistricts = Array.from(new Set(members.map(m => m.district).filter(Boolean))).sort();

    res.json({
      members: paginated,
      pagination: {
        page: pageNum,
        pageSize,
        totalCount,
        totalPages,
      },
      districts: allDistricts,
    });
  } catch (err) {
    console.error('Error listing members:', err);
    res.status(500).json({ error: 'Failed to list members.' });
  }
});

// Single Member Details
app.get('/api/admin/members/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const member = await db.getMemberById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve member.' });
  }
});

// Update Member (Admin Edit)
app.put('/api/admin/members/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, father_name, mobile, address, district, state, photo_url, role } = req.body;

    // Server-side validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name is required.' });
    }
    if (!father_name || father_name.trim().length < 2) {
      return res.status(400).json({ error: "Valid father's name is required." });
    }
    const cleanMobile = mobile?.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
    }

    const updated = await db.updateMember(id, {
      name: name.trim(),
      father_name: father_name.trim(),
      mobile: cleanMobile,
      address: address?.trim(),
      district: district?.trim(),
      state: state?.trim(),
      photo_url: photo_url?.trim(),
      role: role as 'Social Worker' | 'Sahayak' | 'Adhyaksh',
    });

    if (!updated) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    res.json({ success: true, member: updated });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Failed to update member.' });
  }
});

// Approve Member
app.post('/api/admin/members/:id/approve', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const approved = await db.approveMember(id);
    if (!approved) {
      return res.status(404).json({ error: 'Member not found.' });
    }
    res.json({ success: true, message: 'Member approved successfully.', member: approved });
  } catch (err) {
    console.error('Error approving member:', err);
    res.status(500).json({ error: 'Failed to approve member.' });
  }
});

// Reject Member
app.post('/api/admin/members/:id/reject', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const finalReason = reason && reason.trim().length > 0
      ? reason.trim()
      : 'Incomplete or unverified identity documents provided.';

    const rejected = await db.rejectMember(id, finalReason);
    if (!rejected) {
      return res.status(404).json({ error: 'Member not found.' });
    }
    res.json({ success: true, message: 'Member rejected.', member: rejected });
  } catch (err) {
    console.error('Error rejecting member:', err);
    res.status(500).json({ error: 'Failed to reject member.' });
  }
});

// Delete Member
app.delete('/api/admin/members/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await db.deleteMember(id);
    if (!success) {
      return res.status(404).json({ error: 'Member not found.' });
    }
    res.json({ success: true, message: 'Member deleted successfully.' });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: 'Failed to delete member.' });
  }
});

// Admin Get Organization Settings
app.get('/api/admin/settings', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching admin settings:', err);
    res.status(500).json({ error: 'Failed to retrieve organization settings.' });
  }
});

// Admin Update Organization Settings
app.put('/api/admin/settings', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const updates = req.body;
    const updated = await db.updateSettings(updates);
    res.json({ success: true, settings: updated });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update organization settings.' });
  }
});

// Admin Slides Management
app.get('/api/admin/slides', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const slides = await db.getSlides();
    res.json(slides);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slides.' });
  }
});

app.post('/api/admin/slides', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { title, subtitle, image_url, order_num, is_active } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ error: 'Slide title and image are required.' });
    }
    const newSlide = await db.createSlide({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      image_url: image_url.trim(),
      order_num: parseInt(order_num, 10) || 1,
      is_active: is_active !== false,
    });
    res.status(201).json({ success: true, slide: newSlide });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create slide.' });
  }
});

app.put('/api/admin/slides/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateSlide(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Slide not found.' });
    }
    res.json({ success: true, slide: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update slide.' });
  }
});

app.delete('/api/admin/slides/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await db.deleteSlide(id);
    if (!success) {
      return res.status(404).json({ error: 'Slide not found.' });
    }
    res.json({ success: true, message: 'Slide deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete slide.' });
  }
});

app.post('/api/admin/slides/reset-defaults', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const slides = await db.resetSlidesToDefault();
    res.json({ success: true, message: 'Slides reset to official five theme slides.', slides });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset slides.' });
  }
});

// Admin History & Inspiration Management
app.get('/api/admin/history', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const sections = db.getHistorySections(false); // all, including unpublished
    res.json(sections);
  } catch (err) {
    console.error('Error fetching admin history sections:', err);
    res.status(500).json({ error: 'Failed to fetch history sections.' });
  }
});

app.put('/api/admin/history/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      category,
      short_intro,
      full_content,
      image_url,
      order_num,
      is_published,
    } = req.body;

    const updates: Record<string, any> = {};
    if (typeof title === 'string') updates.title = title.trim();
    if (typeof subtitle === 'string') updates.subtitle = subtitle.trim();
    if (typeof category === 'string') updates.category = category.trim();
    if (typeof short_intro === 'string') updates.short_intro = short_intro.trim();
    if (typeof full_content === 'string') updates.full_content = full_content.trim();
    if (typeof image_url === 'string') updates.image_url = image_url.trim();
    if (typeof order_num === 'number' || typeof order_num === 'string') {
      updates.order_num = parseInt(String(order_num), 10) || 1;
    }
    if (typeof is_published === 'boolean') updates.is_published = is_published;

    const updated = await db.updateHistorySection(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'History section not found.' });
    }
    res.json({ success: true, section: updated });
  } catch (err) {
    console.error('Error updating history section:', err);
    res.status(500).json({ error: 'Failed to update history section.' });
  }
});

app.post('/api/admin/history/reset', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const sections = await db.resetHistorySectionsToDefault();
    res.json({ success: true, message: 'All sections reset to verified defaults.', sections });
  } catch (err) {
    console.error('Error resetting history sections:', err);
    res.status(500).json({ error: 'Failed to reset history sections.' });
  }
});

// ==========================================
// ADMIN POST & CONTENT MANAGEMENT
// ==========================================

// Get All Posts (Both published and draft)
app.get('/api/admin/posts', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { category, status } = req.query;
    let posts = db.getPosts(false, typeof category === 'string' ? category : undefined);
    if (status === 'published' || status === 'draft') {
      posts = posts.filter(p => p.status === status);
    }
    res.json({ success: true, posts });
  } catch (err) {
    console.error('Error fetching admin posts:', err);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

// Get Single Post for Admin
app.get('/api/admin/posts/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = db.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json({ success: true, post });
  } catch (err) {
    console.error('Error fetching admin post:', err);
    res.status(500).json({ error: 'Failed to retrieve post.' });
  }
});

// Create Post
app.post('/api/admin/posts', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { title, title_color, content, image_url, category, status, published_at } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Post heading/title is required.' });
    }

    const newPost = await db.createPost({
      title: title.trim(),
      title_color: (title_color && typeof title_color === 'string') ? title_color.trim() : '#0f172a',
      content: typeof content === 'string' ? content : '',
      image_url: typeof image_url === 'string' ? image_url.trim() : '',
      category: typeof category === 'string' && category.trim() ? category.trim() : 'समाचार',
      status: status === 'draft' ? 'draft' : 'published',
      published_at: published_at || new Date().toISOString().split('T')[0],
      author_name: req.admin?.username || 'प्रशासक',
    });

    res.status(201).json({ success: true, post: newPost, message: 'Post created successfully.' });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// Update Post
app.put('/api/admin/posts/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, title_color, content, image_url, category, status, published_at } = req.body;

    const existing = db.getPostById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const updates: Record<string, any> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Post heading/title cannot be empty.' });
      }
      updates.title = title.trim();
    }
    if (title_color !== undefined && typeof title_color === 'string') {
      updates.title_color = title_color.trim();
    }
    if (content !== undefined && typeof content === 'string') {
      updates.content = content;
    }
    if (image_url !== undefined && typeof image_url === 'string') {
      updates.image_url = image_url.trim();
    }
    if (category !== undefined && typeof category === 'string') {
      updates.category = category.trim();
    }
    if (status === 'published' || status === 'draft') {
      updates.status = status;
    }
    if (published_at !== undefined && typeof published_at === 'string') {
      updates.published_at = published_at;
    }

    const updated = await db.updatePost(id, updates);
    res.json({ success: true, post: updated, message: 'Post updated successfully.' });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Failed to update post.' });
  }
});

// Quick toggle status (publish / unpublish / draft)
app.patch('/api/admin/posts/:id/status', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'published' && status !== 'draft') {
      return res.status(400).json({ error: 'Status must be either "published" or "draft".' });
    }

    const updated = await db.updatePost(id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.json({ success: true, post: updated, message: `Post status changed to ${status}.` });
  } catch (err) {
    console.error('Error changing post status:', err);
    res.status(500).json({ error: 'Failed to update post status.' });
  }
});

// Delete Post
app.delete('/api/admin/posts/:id', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.deletePost(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// Reset Posts to Verified Defaults
app.post('/api/admin/posts/reset', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const posts = await db.resetPostsToDefault();
    res.json({ success: true, message: 'All posts reset to verified defaults.', posts });
  } catch (err) {
    console.error('Error resetting posts:', err);
    res.status(500).json({ error: 'Failed to reset posts.' });
  }
});

// Fallback for unmatched API routes to prevent returning HTML SPA
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Paswan Ekta Manch running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
