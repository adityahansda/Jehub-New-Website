import { Telegraf, Context } from 'telegraf';

interface TelegramMember {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  is_bot: boolean;
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
  joined_date?: string;
}

interface GroupMemberData {
  user_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  display_name: string;
  status: string;
  is_premium?: boolean;
  joined_at: string;
  left_at?: string;
  is_active: boolean;
}

class TelegramService {
  private bot: Telegraf;
  private chatId: string;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
    this.chatId = process.env.TELEGRAM_GROUP_CHAT_ID || '';
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle new members joining
    this.bot.on('new_chat_members', async (ctx) => {
      console.log('New members joined:', ctx.message.new_chat_members);
      
      for (const member of ctx.message.new_chat_members || []) {
        if (!member.is_bot) {
          await this.handleMemberJoin(member, ctx);
        }
      }
    });

    // Handle members leaving
    this.bot.on('left_chat_member', async (ctx) => {
      console.log('Member left:', ctx.message.left_chat_member);
      
      if (ctx.message.left_chat_member && !ctx.message.left_chat_member.is_bot) {
        await this.handleMemberLeave(ctx.message.left_chat_member, ctx);
      }
    });

    // Handle chat member updates (admin changes, restrictions, etc.)
    this.bot.on('chat_member', async (ctx) => {
      console.log('Chat member updated:', ctx.chatMember);
      await this.handleMemberStatusUpdate(ctx);
    });
  }

  private async handleMemberJoin(member: any, ctx: Context) {
    try {
      const memberData: GroupMemberData = {
        user_id: member.id,
        username: member.username,
        first_name: member.first_name,
        last_name: member.last_name,
        display_name: this.getDisplayName(member),
        status: 'member',
        joined_at: new Date().toISOString(),
        is_active: true
      };

      // Call your API to add member
      await this.updateMemberInDatabase(memberData, 'join');
      
      console.log(`Member ${memberData.display_name} added to database`);
    } catch (error) {
      console.error('Error handling member join:', error);
    }
  }

  private async handleMemberLeave(member: any, ctx: Context) {
    try {
      const memberData: GroupMemberData = {
        user_id: member.id,
        username: member.username,
        first_name: member.first_name,
        last_name: member.last_name,
        display_name: this.getDisplayName(member),
        status: 'left',
        joined_at: '', // Will be updated from existing data
        left_at: new Date().toISOString(),
        is_active: false
      };

      // Call your API to update member status
      await this.updateMemberInDatabase(memberData, 'leave');
      
      console.log(`Member ${memberData.display_name} marked as left`);
    } catch (error) {
      console.error('Error handling member leave:', error);
    }
  }

  private async handleMemberStatusUpdate(ctx: any) {
    try {
      const { old_chat_member, new_chat_member } = ctx.chatMember;
      
      if (old_chat_member.status !== new_chat_member.status) {
        const memberData: GroupMemberData = {
          user_id: new_chat_member.user.id,
          username: new_chat_member.user.username,
          first_name: new_chat_member.user.first_name,
          last_name: new_chat_member.user.last_name,
          display_name: this.getDisplayName(new_chat_member.user),
          status: new_chat_member.status,
          joined_at: new Date().toISOString(),
          is_active: ['member', 'administrator', 'creator'].includes(new_chat_member.status)
        };

        await this.updateMemberInDatabase(memberData, 'update');
      }
    } catch (error) {
      console.error('Error handling member status update:', error);
    }
  }

  // Fetch all current group members (initial sync)
  async fetchAllGroupMembers(): Promise<GroupMemberData[]> {
    try {
      const chatId = this.chatId;
      const members: GroupMemberData[] = [];
      
      // Get administrators first
      const admins = await this.bot.telegram.getChatAdministrators(chatId);
      
      for (const admin of admins) {
        if (!admin.user.is_bot) {
          members.push({
            user_id: admin.user.id,
            username: admin.user.username,
            first_name: admin.user.first_name,
            last_name: admin.user.last_name,
            display_name: this.getDisplayName(admin.user),
            status: admin.status,
            is_premium: admin.user.is_premium,
            joined_at: new Date().toISOString(),
            is_active: true
          });
        }
      }

      // Note: Getting all members requires special permissions
      // For public groups, you might need to implement a different approach
      
      return members;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
  }

  // Get member count
  async getMemberCount(): Promise<number> {
    try {
      const chatMemberCount = await this.bot.telegram.getChatMembersCount(this.chatId);
      return chatMemberCount;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
    }
  }

  // Check if user is member
  async checkMemberStatus(userId: number): Promise<string> {
    try {
      const member = await this.bot.telegram.getChatMember(this.chatId, userId);
      return member.status;
    } catch (error) {
      console.error('Error checking member status:', error);
      return 'left';
    }
  }

  private getDisplayName(user: any): string {
    if (user.username) {
      return `@${user.username}`;
    }
    return `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`;
  }

  private async updateMemberInDatabase(memberData: GroupMemberData, action: 'join' | 'leave' | 'update') {
    try {
      // Import the appwrite service dynamically to avoid circular dependencies
      const { default: appwriteService } = await import('./telegramMembersService');
      
      switch (action) {
        case 'join':
          await appwriteService.addMemberToDatabase(memberData);
          break;
        case 'leave':
          memberData.is_active = false;
          await appwriteService.updateMemberInDatabase(memberData);
          break;
        case 'update':
          await appwriteService.updateMemberInDatabase(memberData);
          break;
      }
      
      return { success: true, action, user_id: memberData.user_id };
    } catch (error) {
      console.error('Error updating member in database:', error);
      throw error;
    }
  }

  // Start the bot
  startBot() {
    this.bot.launch();
    console.log('Telegram bot started successfully');
    
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  // Manual sync function
  async syncGroupMembers() {
    try {
      const members = await this.fetchAllGroupMembers();
      
      // Update all members in database
      for (const member of members) {
        await this.updateMemberInDatabase(member, 'update');
      }
      
      console.log(`Synced ${members.length} group members`);
      return members;
    } catch (error) {
      console.error('Error syncing group members:', error);
      throw error;
    }
  }
}

const telegramServiceInstance = new TelegramService();

module.exports = telegramServiceInstance;
export default telegramServiceInstance;
