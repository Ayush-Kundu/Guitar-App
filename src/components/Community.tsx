import React, { useState, useRef, useEffect } from "react";
import { useUser, supabase } from "../contexts/UserContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Users,
  MessageCircle,
  Share2,
  Search,
  Send,
  Plus,
  Check,
  X,
  Globe,
  Star,
  Guitar,
  Hash,
  ChevronLeft,
  MoreVertical,
  Circle,
  Info,
  Zap,
  Sparkles,
  Mic,
  Music,
  Target,
  TrendingUp,
  AlertTriangle,
  Shield,
} from "lucide-react";

// Fix image imports - use relative paths
import guitarCharacter from "../assets/20250901_1300_Guitar Character Action Change_remix_01k43dpxbpe93vepc15pn9e6jw.png";
import guitarConstruction from "../assets/20250901_1522_Purple Jam Room_remix_01k43nwhv7f4zv70dwyj8835pa.png";
import guitarFriends from "../assets/20250901_1845_Guitar-Themed_Characters_remix_01k441dxt7edj9qy8g7brph33a-removebg-preview.png";
import blueCharacter from "../assets/20250904_2133_Peekaboo Guitar Pick_remix_01k4c28vaaf6htdhw4h37z2h8b.png";

// Import all avatar options
import avatar1 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (1).png";
import avatar2 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (2).png";
import avatar3 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (3).png";
import avatar4 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (4).png";
import avatar5 from "../assets/20260124_1729_Image Generation_remix_01kfsc93hye3pvncmet7494507-Picsart-CropImage (5).png";
import avatar6 from "../assets/avatar-enhanced.png";

// Avatar options map for quick lookup
const avatarMap: { [key: number]: string } = {
  1: avatar1,
  2: avatar2,
  3: avatar3,
  4: avatar4,
  5: avatar5,
  6: avatar6,
};

export function Community() {
  const {
    user,
    friends,
    friendRequests,
    blockedUsers,
    chats,
    communityPosts,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    createChat,
    sendMessage,
    getChatMessages,
    createCommunityPost,
    likeCommunityPost,
    allUsers, // This contains the users from Supabase
    onlineUsers,
    isConnected,
    fetchCommunityPosts,
    setCommunityPosts,
    fetchFriendRequests,
    fetchUsersFromSupabase,
    fetchFriends, // To refresh friends list after accepting request
  } = useUser();

  const [activeView, setActiveView] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [postContent, setPostContent] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showAddFriendsDialog, setShowAddFriendsDialog] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserForChat, setSelectedUserForChat] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [showCommunityWarning, setShowCommunityWarning] = useState(false);
  const debugRanRef = useRef(false); // Track if debug has run for this session
  
  // Direct Supabase friend request data
  const [directReceivedRequests, setDirectReceivedRequests] = useState<any[]>([]);
  const [directSentRequests, setDirectSentRequests] = useState<any[]>([]);
  const [deniedRequests, setDeniedRequests] = useState<any[]>([]); // Requests that were declined
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]); // Requests I sent that were accepted by others
  const [myAcceptedRequests, setMyAcceptedRequests] = useState<any[]>([]); // Requests I received and accepted
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showDeniedAlert, setShowDeniedAlert] = useState(false); // Show alert for denied requests
  const [showAcceptedAlert, setShowAcceptedAlert] = useState(false); // Show alert for accepted requests
  
  // Direct messages from Supabase friend_messages table
  const [directChatMessages, setDirectChatMessages] = useState<any[]>([]);

  // Get selected avatar from localStorage
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(() => {
    const saved = localStorage.getItem('guitarApp_selectedAvatar');
    return saved ? parseInt(saved, 10) : 6;
  });

  // Get the current avatar image
  const avatarImage = avatarMap[selectedAvatarId] || avatar6;

  // Listen for avatar changes from Settings page
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('guitarApp_selectedAvatar');
      if (saved) {
        setSelectedAvatarId(parseInt(saved, 10));
      }
    };

    // Check for changes when component is focused
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Early return if no user - prevents crashes during loading/auth issues
  if (!user) {
    return (
      <div className="page-content">
        <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // chats updated from UserContext
  }, [chats]);

  // Helper function to fetch messages for a specific chat
  const fetchMessagesForChat = async (chatId: string, otherUserId: string) => {
    const { data, error } = await supabase
      .from('friend_messages')
      .select('*')
      .or(`and(send_user.eq.${user.id},receive_user.eq.${otherUserId}),and(send_user.eq.${otherUserId},receive_user.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching friend_messages:', error);
      return [];
    }

    const relevantMessages = data || [];

    // Format messages for display
    return relevantMessages.map(msg => ({
      id: `fm_${msg.id}`,
      chatId: chatId,
      senderId: msg.send_user,
      senderName: allUsers.find(u => u.id === msg.send_user)?.name || 'Unknown',
      senderUsername: allUsers.find(u => u.id === msg.send_user)?.username || 'unknown',
      content: msg.message,
      timestamp: msg.created_at,
      type: 'text' as const
    }));
  };

  // Refs to store current values without causing re-renders
  const chatsRef = useRef(chats);
  const allUsersRef = useRef(allUsers);
  
  // Keep refs updated
  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { allUsersRef.current = allUsers; }, [allUsers]);

  // Fetch messages when chat is selected + set up polling for real-time updates
  useEffect(() => {
    if (!selectedChat || !user) {
      setDirectChatMessages([]);
      return;
    }

    // Use ref for chats to avoid dependency issues
    const currentChats = chatsRef.current;
    const currentChat = currentChats.find(c => c.id === selectedChat);
    if (!currentChat) {
      return;
    }

    const otherUserId = currentChat.participants.find(p => p !== user.id);
    if (!otherUserId) {
      return;
    }

    // Initial fetch
    const loadMessages = async () => {
      const messages = await fetchMessagesForChat(selectedChat, otherUserId);
      setDirectChatMessages(messages);
    };

    loadMessages();

    // Polling every 3 seconds as backup for real-time
    const pollInterval = setInterval(async () => {
      const messages = await fetchMessagesForChat(selectedChat, otherUserId);
      setDirectChatMessages(prev => {
        // Only update if there are new messages
        if (messages.length !== prev.length) {
          return messages;
        }
        return prev;
      });
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [selectedChat, user?.id]); // Only depend on selectedChat and user.id

  // Check if user has seen the community warning on first visit
  useEffect(() => {
    if (user) {
      const warningKey = `guitarApp_communityWarning_${user.id}`;
      const hasSeenWarning = localStorage.getItem(warningKey);
      if (!hasSeenWarning) {
        setShowCommunityWarning(true);
      }
    }
  }, [user]);

  const handleAcceptCommunityGuidelines = () => {
    if (user) {
      const warningKey = `guitarApp_communityWarning_${user.id}`;
      localStorage.setItem(warningKey, 'accepted');
      setShowCommunityWarning(false);
    }
  };

  // Note: Friend requests are fetched directly from Supabase in the useEffect below
  // Removed the context's fetchFriendRequests call to avoid infinite loops

  // Direct Supabase query for friend requests (runs once per view switch)
  useEffect(() => {
    // Only run once when switching to friends view, prevent infinite loops
    if (activeView === 'friends' && user?.id && !debugRanRef.current) {
      debugRanRef.current = true; // Mark as ran
      
      const fetchDirectFriendRequests = async () => {
        const userId = user.id;
        const userName = user.name;
        setIsLoadingRequests(true);
        try {
          // Fetch ALL friend_requests to check for mismatched user IDs
          const { data: allRequests, error: allError } = await supabase
            .from('friend_requests')
            .select('*');

          // FIX MISMATCHED USER IDs: Check if any requests have the user's NAME but a DIFFERENT user_id
          if (allRequests && allRequests.length > 0 && userName) {
            const mismatchedAsRecipient = allRequests.filter(
              req => req.to_user_name?.toLowerCase() === userName.toLowerCase() && 
                     req.to_user_id !== userId &&
                     req.status === 'pending'
            );
            
            const mismatchedAsSender = allRequests.filter(
              req => req.from_user_name?.toLowerCase() === userName.toLowerCase() && 
                     req.from_user_id !== userId &&
                     req.status === 'pending'
            );
            
            // Fix mismatched recipient IDs
            if (mismatchedAsRecipient.length > 0) {
              for (const req of mismatchedAsRecipient) {
                const { error: updateError } = await supabase
                  .from('friend_requests')
                  .update({ to_user_id: userId })
                  .eq('id', req.id);
                
                if (updateError) {
                  console.error('Failed to fix recipient user_id:', updateError.message);
                }
              }
            }

            // Fix mismatched sender IDs
            if (mismatchedAsSender.length > 0) {
              for (const req of mismatchedAsSender) {
                const { error: updateError } = await supabase
                  .from('friend_requests')
                  .update({ from_user_id: userId })
                  .eq('id', req.id);
                
                if (updateError) {
                  console.error('Failed to fix sender user_id:', updateError.message);
                }
              }
            }
          }

          // Re-fetch after potential fixes - Fetch received requests (where user is the recipient)
          const { data: receivedData, error: receivedError } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('to_user_id', userId)
            .eq('status', 'pending');

          // Fetch sent requests (where user is the sender) - PENDING
          const { data: sentData, error: sentError } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('from_user_id', userId)
            .eq('status', 'pending');

          // Fetch DECLINED requests (where user sent a request that was denied)
          const { data: deniedData, error: deniedError } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('from_user_id', userId)
            .eq('status', 'declined');

          // Fetch ACCEPTED requests (where user sent a request that was accepted)
          const { data: acceptedData, error: acceptedError } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('from_user_id', userId)
            .eq('status', 'accepted');

          // Transform and store received requests (use String(id) to match context format)
          if (receivedData && !receivedError) {
            const transformedReceived = receivedData.map(req => ({
              id: String(req.id),  // Convert to string to match context's friendRequests format
              fromUserId: req.from_user_id,
              toUserId: req.to_user_id,
              fromUserName: req.from_user_name || 'Unknown User',
              fromUsername: req.from_username || 'unknown',
              toUserName: req.to_user_name || 'Unknown User',
              toUsername: req.to_username || 'unknown',
              status: req.status,
              timestamp: req.created_at || new Date().toISOString()
            }));
            setDirectReceivedRequests(transformedReceived);
          } else {
            setDirectReceivedRequests([]);
          }

          // Transform and store sent requests (use String(id) to match context format)
          if (sentData && !sentError) {
            const transformedSent = sentData.map(req => ({
              id: String(req.id),  // Convert to string to match context's friendRequests format
              fromUserId: req.from_user_id,
              toUserId: req.to_user_id,
              fromUserName: req.from_user_name || 'Unknown User',
              fromUsername: req.from_username || 'unknown',
              toUserName: req.to_user_name || 'Unknown User',
              toUsername: req.to_username || 'unknown',
              status: req.status,
              timestamp: req.created_at || new Date().toISOString()
            }));
            setDirectSentRequests(transformedSent);
          } else {
            setDirectSentRequests([]);
          }

          // Transform and store DENIED requests
          if (deniedData && !deniedError && deniedData.length > 0) {
            const transformedDenied = deniedData.map(req => ({
              id: String(req.id),
              fromUserId: req.from_user_id,
              toUserId: req.to_user_id,
              fromUserName: req.from_user_name || 'Unknown User',
              fromUsername: req.from_username || 'unknown',
              toUserName: req.to_user_name || 'Unknown User',
              toUsername: req.to_username || 'unknown',
              status: req.status,
              timestamp: req.updated_at || req.created_at || new Date().toISOString()
            }));
            setDeniedRequests(transformedDenied);
            setShowDeniedAlert(true); // Show the notification
          } else {
            setDeniedRequests([]);
          }

          // Transform and store ACCEPTED requests
          if (acceptedData && !acceptedError && acceptedData.length > 0) {
            const transformedAccepted = acceptedData.map(req => ({
              id: String(req.id),
              fromUserId: req.from_user_id,
              toUserId: req.to_user_id,
              fromUserName: req.from_user_name || 'Unknown User',
              fromUsername: req.from_username || 'unknown',
              toUserName: req.to_user_name || 'Unknown User',
              toUsername: req.to_username || 'unknown',
              status: req.status,
              timestamp: req.updated_at || req.created_at || new Date().toISOString()
            }));
            setAcceptedRequests(transformedAccepted);
            setShowAcceptedAlert(true); // Show the success notification
          } else {
            setAcceptedRequests([]);
          }

          // SYNC: Also update the context's friendRequests so accept/decline functions work
          await fetchFriendRequests();
        } catch (error) {
          console.error('❌ Error fetching friend requests:', error);
          setDirectReceivedRequests([]);
          setDirectSentRequests([]);
        } finally {
          setIsLoadingRequests(false);
        }
      };

      fetchDirectFriendRequests();
    }
    
    // Reset when leaving friends view so it runs again next time
    if (activeView !== 'friends') {
      debugRanRef.current = false;
    }
  }, [activeView, user?.id]);

  // Function to manually refresh direct requests
  const refreshDirectRequests = async () => {
    if (!user?.id) return;
    
    setIsLoadingRequests(true);
    debugRanRef.current = false; // Reset so it fetches again
    
    const userId = user.id;
    
    try {
      const { data: receivedData } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('to_user_id', userId)
        .eq('status', 'pending');

      const { data: sentData } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('from_user_id', userId)
        .eq('status', 'pending');

      if (receivedData) {
        const transformedReceived = receivedData.map(req => ({
          id: String(req.id),  // Convert to string to match context's friendRequests format
          fromUserId: req.from_user_id,
          toUserId: req.to_user_id,
          fromUserName: req.from_user_name || 'Unknown User',
          fromUsername: req.from_username || 'unknown',
          toUserName: req.to_user_name || 'Unknown User',
          toUsername: req.to_username || 'unknown',
          status: req.status,
          timestamp: req.created_at || new Date().toISOString()
        }));
        setDirectReceivedRequests(transformedReceived);
      }

      if (sentData) {
        const transformedSent = sentData.map(req => ({
          id: String(req.id),  // Convert to string to match context's friendRequests format
          fromUserId: req.from_user_id,
          toUserId: req.to_user_id,
          fromUserName: req.from_user_name || 'Unknown User',
          fromUsername: req.from_username || 'unknown',
          toUserName: req.to_user_name || 'Unknown User',
          toUsername: req.to_username || 'unknown',
          status: req.status,
          timestamp: req.created_at || new Date().toISOString()
        }));
        setDirectSentRequests(transformedSent);
      }
      
      // SYNC: Also update the context's friendRequests so accept/decline functions work
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error refreshing requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  if (!user) {
    return null;
  }

  const searchResults = searchUsers(searchQuery);
  const friendUsers = allUsers.filter((u) => friends.includes(u.id));
  const pendingRequests = friendRequests.filter((req) => req.status === "pending");
  const receivedRequests = pendingRequests.filter((req) => req.toUserId === user.id);
  const sentRequests = pendingRequests.filter((req) => req.fromUserId === user.id);

  const handleCreatePost1 = async () => {
    if (!postContent.trim()) return;
  
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postContent }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to create post");
      }
  
      const newPost = await res.json();
  
      // Update local feed immediately
      // setCommunityPosts1((prev) => [newPost, ...prev]); // This line was removed as per the new_code
      setPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };
  

  const handleSendFriendRequest = async (usernameOrUserId: string) => {
    try {
      await sendFriendRequest(usernameOrUserId);
      setUserSearchQuery("");
      // Show success message
      alert("Friend request sent successfully!");
      // The real-time subscription should handle updating the UI
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      const errorMessage = error.message || "Failed to send friend request";
      
      // Show a more helpful error message
      if (errorMessage.includes('demo mode')) {
        alert(`${errorMessage}\n\nTo use friend features:\n1. Sign out from your current account\n2. Create a new account or sign in with your Supabase credentials\n3. Friend requests will then be saved to the database`);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !messageInput.trim()) return;

    try {
      // Get the receiver ID from the selected chat
      const currentChat = chats.find(c => c.id === selectedChat);
      const receiverId = currentChat?.participants.find(p => p !== user.id);
      
      // sendMessage params: chatId, content, receiverId
      // sender_id (user_1) is automatically set from logged-in user
      // receiver_id (user_2) is the other participant in the chat
      await sendMessage(selectedChat, messageInput, receiverId);
      
      setMessageInput("");
    } catch (error) {
      console.error("❌ COMMUNITY: Error sending message:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    try {
      await createCommunityPost(postContent);
      setPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const existingChat = chats.find(
        (chat) =>
          chat.type === "private" &&
          chat.participants.includes(friendId) &&
          chat.participants.includes(user.id)
      );

      if (existingChat) {
        setSelectedChat(existingChat.id);
        setActiveView("messages");
      } else {
        const newChat = await createChat([friendId]);
        setSelectedChat(newChat.id);
        setActiveView("messages");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;

    try {
      const newChat = await createChat(selectedFriends, true, groupName);
      setSelectedChat(newChat.id);
      setActiveView("messages");
      setShowNewGroupDialog(false);
      setGroupName("");
      setSelectedFriends([]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const navigationItems = [
    {
      id: "discover",
      label: "Discover",
      icon: Sparkles,
      description: "Community feed",
    },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      description: "Friend requests & friends",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      description: "Chat with friends",
    },
    {
      id: "jamroom",
      label: "Jam Room",
      icon: Music,
      description: "Live sessions",
    },
  ];

  // Refs for sliding animation
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  // Update slider position when active tab changes
  useEffect(() => {
    if (tabsListRef.current) {
      const activeTabElement = tabsListRef.current.querySelector(
        `[data-value="${activeView}"]`
      ) as HTMLElement;
      if (activeTabElement) {
        const rect = activeTabElement.getBoundingClientRect();
        const parentRect = tabsListRef.current.getBoundingClientRect();

        setSliderStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [activeView]);

  // Fetch posts once when component mounts (empty dependency array to prevent loops)
  useEffect(() => {
    // Wrap in try-catch to prevent crashes on concurrent access
    const loadPosts = async () => {
      try {
    if (fetchCommunityPosts) {
          await fetchCommunityPosts();
        }
      } catch (error) {
        // Error loading community posts, continuing anyway
      }
    };
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add function to handle starting a direct message with a user
  const handleStartDirectMessage = async (userId: string) => {
    try {
      const existingChat = chats.find(
        (chat) =>
          chat.type === "private" &&
          chat.participants.includes(userId) &&
          chat.participants.includes(user.id)
      );

      if (existingChat) {
        setSelectedChat(existingChat.id);
        setActiveView("messages");
      } else {
        const newChat = await createChat([userId]);
        setSelectedChat(newChat.id);
        setActiveView("messages");
      }
      setShowAddFriendsDialog(false);
      setUserSearchQuery("");
    } catch (error) {
      console.error("Error starting direct message:", error);
    }
  };

  const renderNavigation = () => (
    <div className="mb-8">
      {/* Users List - Above The Daily Guitarist */}
      
      {/* The Daily Guitarist Header */}
      <div className="daily-guitarist-header bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl mb-6 relative overflow-hidden">
        <div className="flex items-center justify-center ">
          <div className="relative">
            <img 
              src={guitarCharacter} 
              alt="Guitar Character" 
              className="w-full h-full object-contain object-center drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Compact Navigation Bar with Cartoon Orange Style */}
      <div className="community-navbar bg-white dark:bg-gray-800 rounded-2xl border-1 border-orange-200 border-b-4 p-1 relative overflow-hidden">
        <div ref={tabsListRef} className="flex items-center relative">
          {/* Sliding cartoon highlight */}
          <div
            className="absolute top-1 bottom-1 bg-orange-300 rounded-xl transition-all duration-300 ease-out"
            style={{
              left: `${sliderStyle.left + 4}px`,
              width: `${sliderStyle.width - 8}px`,
              opacity: sliderStyle.width > 0 ? 1 : 0,
            }}
          />
      

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            // Show notification badge for Friends tab if there are pending friend requests (use direct Supabase data)
            const showBadge = item.id === "friends" && directReceivedRequests.length > 0;
            
            return (
              <button
                key={item.id}
                data-value={item.id}
                onClick={() => setActiveView(item.id)}
                className="community-nav-item flex-1 relative px-6 py-3 transition-all duration-300 group z-10"
              >
                <div className="flex items-center justify-center relative">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive
                        ? "text-white scale-110"
                        : "text-gray-500 group-hover:text-orange-500 group-hover:scale-110"
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {directReceivedRequests.length}
                    </span>
                  )}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.label}
                  {showBadge && ` (${directReceivedRequests.length} new)`}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-700"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDiscoverView = () => (
    <>
      <div className="max-w-4xl mx-auto space-y-0 px-4 sm:px-6 lg:px-8 font-['Fredoka'] text-gray-400">
        {/* Enhanced Create Post - Responsive & Snazzy */}
        <Card style={{border: '2px solid rgb(240, 240, 240)'}} className="border-0 bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-gray-200 dark:border-gray-700 border-t-10 transition-all duration-500 hover:scale-[1.01] rounded-2xl overflow-hidden font-['Fredoka'] text-gray-400">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Avatar - Responsive sizing */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden">
                  <img 
                    src={avatarImage} 
                    alt="Avatar" 
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
                <div className="text-lg text-gray-400 font-['Fredoka']">{user.name}</div>
              </div>
              {/* Content - Full width on mobile */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex gap-3 items-end">
                  <Textarea
                    placeholder={`Share your story ${user.name}...`}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="flex-1 min-h-[100px] sm:min-h-[120px] border border-gray-100 rounded-xl resize-none font-['Fredoka'] text-gray-300 placeholder-gray-300"
                  />
                  <Button
                    onClick={handleCreatePost}
                    disabled={!postContent.trim()}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 border border-blue-200 dark:border-blue-700 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 rounded-xl relative overflow-hidden group font-['Fredoka'] text-white"
                    style={{
                      background: 'rgb(122, 191, 255)',
                      border: '2px solid rgb(122, 191, 255)',
                      height: '36px',
                      width: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      hover: {
                      }
                    }}
                  >
                    {/* Gleam effect overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
                        transform: 'translateX(-100%)',
                        animation: 'gleam 1.5s ease-in-out infinite'
                      }}
                    />
                    <Send className="w-4 h-4 relative z-10" />
                  </Button>
                </div>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Posts - Responsive Grid */}
        <div className="space-y-4 p-4">
          {communityPosts.map((post, index) => (
            <Card
              key={`community-post-${post.id}-${index}`}
              className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar - Responsive */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden relative shrink-0">
                    <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                    {onlineUsers.includes(post.userId) && (
                      <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-green-500 text-green-500 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-white rounded-full" />
                    )}
                  </div>
                  
                  {/* Content - Responsive */}
                  <div className="flex-1 min-w-0">
                    {/* Header - Responsive layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                        {post.userName}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatTime(post.timestamp)}
                      </span>
                    </div>

                    {/* Post content - Better typography */}
                    <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed text-sm sm:text-base break-words">
                      {post.content}
                    </p>

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Empty state */}
          {communityPosts.length === 0 && (
            <Card className="border-0 bg-gradient-to-br from-gray-50 to-orange-50/30 dark:from-gray-800 dark:to-orange-900/20 rounded-2xl">
              <CardContent className="p-8 text-center">
                <Guitar className="w-16 h-16 mx-auto mb-4 text-orange-400 opacity-60" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to share your guitar journey!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );

  const renderJamRoomView = () => (
    <div className="space-y-6">
      <Card className="border-purple-200 dark:border-purple-800 rounded-2xl">
        <img 
    src={guitarConstruction} 
    alt="Guitar Construction" 
    className="w-full h-64 object-contain object-center rounded-2xl border border-purple-200 dark:border-purple-800 p-1" 
  />
      </Card>
    </div>
  );

  // Friends view - shows friend requests and friends list
  const renderFriendsView = () => {
    // Get friends from context (friendships table)
    const contextFriendUsers = allUsers.filter((u) => friends.includes(u.id));
    
    // Get users who accepted our friend requests (from acceptedRequests - toUserId is the friend)
    const acceptedFriendIds = acceptedRequests.map(r => r.toUserId);
    const acceptedFriendUsers = allUsers.filter((u) => acceptedFriendIds.includes(u.id));
    
    // Get users whose requests WE accepted (from myAcceptedRequests - fromUserId is the friend)
    const myAcceptedFriendIds = myAcceptedRequests.map(r => r.fromUserId);
    const myAcceptedFriendUsers = allUsers.filter((u) => myAcceptedFriendIds.includes(u.id));
    
    // Create user objects from acceptedRequests data if not found in allUsers (users who accepted OUR requests)
    const acceptedFriendsFromRequests = acceptedRequests
      .filter(r => !allUsers.find(u => u.id === r.toUserId))
      .map(r => ({
        id: r.toUserId,
        name: r.toUserName,
        username: r.toUsername,
        email: '',
        level: 'beginner' as const,
        musicPreferences: [],
        practiceStreak: 0,
        songsMastered: 0,
        chordsLearned: 0,
        hoursThisWeek: 0,
        totalPoints: 0,
        weeklyPoints: 0,
        levelProgress: 0,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));
    
    // Create user objects from myAcceptedRequests data if not found in allUsers (users whose requests WE accepted)
    const myAcceptedFriendsFromRequests = myAcceptedRequests
      .filter(r => !allUsers.find(u => u.id === r.fromUserId))
      .map(r => ({
        id: r.fromUserId,
        name: r.fromUserName,
        username: r.fromUsername,
        email: '',
        level: 'beginner' as const,
        musicPreferences: [],
        practiceStreak: 0,
        songsMastered: 0,
        chordsLearned: 0,
        hoursThisWeek: 0,
        totalPoints: 0,
        weeklyPoints: 0,
        levelProgress: 0,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));
    
    // Combine all friends - remove duplicates by id
    const seenIds = new Set<string>();
    const friendUsers: typeof contextFriendUsers = [];
    
    // Add from each source, skipping duplicates
    for (const user of [...contextFriendUsers, ...acceptedFriendUsers, ...myAcceptedFriendUsers, ...acceptedFriendsFromRequests, ...myAcceptedFriendsFromRequests]) {
      if (!seenIds.has(user.id)) {
        seenIds.add(user.id);
        friendUsers.push(user);
      }
    }
    
    // Use direct Supabase data instead of context data
    const receivedRequests = directReceivedRequests;
    const sentRequests = directSentRequests;
    const blockedUserList = allUsers.filter((u) => blockedUsers.includes(u.id));

    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Accepted Requests Alert Banner - SUCCESS! */}
        {showAcceptedAlert && acceptedRequests.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  🎉 {acceptedRequests.length === 1 
                    ? 'Your friend request was accepted!' 
                    : `${acceptedRequests.length} friend requests were accepted!`}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  You are now friends with {acceptedRequests.map(r => r.toUserName).join(', ')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setShowAcceptedAlert(false); setAcceptedRequests([]); }}
              className="p-2 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
          </div>
        )}

        {/* Denied Requests Alert Banner */}
        {showDeniedAlert && deniedRequests.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  {deniedRequests.length === 1 
                    ? 'Your friend request was denied' 
                    : `${deniedRequests.length} friend requests were denied`}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {deniedRequests.map(r => r.toUserName).join(', ')} declined your request
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setShowDeniedAlert(false); setDeniedRequests([]); }}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}

        {/* Friend Requests Section - Always visible */}
          <Card className="border-yellow-200 dark:border-yellow-800" style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Friend Requests
              {isLoadingRequests && (
                <div className="ml-2 w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              )}
                {receivedRequests.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white">
                    {receivedRequests.length} new
                  </Badge>
                )}
              <button
                onClick={refreshDirectRequests}
                className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh friend requests"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              </CardTitle>
            </CardHeader>
              {receivedRequests.length > 0 ? (
            <CardContent>
                <div className="space-y-3">
                  {receivedRequests.map((request) => {
                    const requestUser = allUsers.find(u => u.id === request.fromUserId);
                    const isProcessing = processingRequestId === request.id;
                    
                    const handleAccept = async () => {
                      setProcessingRequestId(request.id);
                      try {
                        await acceptFriendRequest(request.id);
                        // Add to myAcceptedRequests so the friend shows immediately in Friends card
                        setMyAcceptedRequests(prev => [...prev, request]);
                        // Refresh the friends list to show the new friend
                        await fetchFriends();
                        // Refresh the direct requests to update the UI
                        await refreshDirectRequests();
                        // Show success message and navigate to Messages tab
                        alert(`🎸 You are now friends with ${request.fromUserName}! Head to Messages to start chatting.`);
                        // Auto-navigate to Messages tab to show the new chat
                        setActiveView("messages");
                      } catch (error: any) {
                        console.error("Error accepting friend request:", error);
                        alert(error.message || "Failed to accept friend request. Please try again.");
                      } finally {
                        setProcessingRequestId(null);
                      }
                    };
                    
                    const handleDecline = async () => {
                      setProcessingRequestId(request.id);
                      try {
                        await declineFriendRequest(request.id);
                        alert(`Friend request from ${request.fromUserName} declined.`);
                      // Refresh the direct requests to update the UI
                      await refreshDirectRequests();
                      } catch (error: any) {
                        console.error("Error declining friend request:", error);
                        alert(error.message || "Failed to decline friend request. Please try again.");
                      } finally {
                        setProcessingRequestId(null);
                      }
                    };
                    
                    return (
                      <div
                        key={`friend-request-${request.id}`}
                        className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                            {onlineUsers.includes(request.fromUserId) && (
                              <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{request.fromUserName}</p>
                            <p className="text-sm text-gray-500">@{request.fromUsername}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(request.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={isProcessing}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
                            title="Accept friend request"
                          >
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDecline}
                            disabled={isProcessing}
                            className="border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-50"
                            title="Decline friend request"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </CardContent>
              ) : (
            <CardContent>
              <div className="text-center py-6 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No pending friend requests</p>
                <p className="text-sm">When someone sends you a friend request, it will appear here.</p>
                </div>
            </CardContent>
          )}
          </Card>

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <Card style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" />
                  Sent Requests ({sentRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentRequests.map((request) => {
                    return (
                      <div
                        key={`sent-request-${request.id}`}
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                            {onlineUsers.includes(request.toUserId) && (
                              <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{request.toUserName}</p>
                            <p className="text-sm text-gray-500">@{request.toUsername}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          Pending
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Denied Requests Section */}
        {deniedRequests.length > 0 && (
          <Card className="border-red-200 dark:border-red-800" style={{ border: '2.5px solid rgb(254, 202, 202)' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <X className="w-5 h-5" />
                Denied Requests ({deniedRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deniedRequests.map((request) => (
                  <div
                    key={`denied-request-${request.id}`}
                    className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                      </div>
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-300">{request.toUserName}</p>
                        <p className="text-sm text-red-500 dark:text-red-400">@{request.toUsername}</p>
                        <p className="text-xs text-red-400 dark:text-red-500 mt-1">
                          Denied • You cannot send another request
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-300 bg-red-100 dark:bg-red-900/50">
                      Denied
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

          {/* Friends List */}
          <Card style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Friends ({friendUsers.length})
                </CardTitle>
                <Dialog open={showAddFriendsDialog} onOpenChange={(open) => {
                  setShowAddFriendsDialog(open);
                  if (open) {
                    // Fetch users when dialog opens
                    fetchUsersFromSupabase();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 text-white font-['Fredoka'] flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Friends
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-['Fredoka'] text-blue-600">Find Friends</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search users by name or username..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="pl-10 border-2 border-blue-200 focus:border-blue-400 rounded-xl font-['Fredoka']"
                        />
                      </div>
                      
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {userSearchQuery.trim() && searchUsers(userSearchQuery)
                            .filter(u => u.id !== user.id && !friends.includes(u.id) && !blockedUsers.includes(u.id))
                            .map((searchUser) => (
                              <div
                                key={`search-user-${searchUser.id}`}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                    <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                                    {onlineUsers.includes(searchUser.id) && (
                                      <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium font-['Fredoka']">{searchUser.name}</p>
                                    <p className="text-sm text-gray-500">@{searchUser.username}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSendFriendRequest(searchUser.id)}
                                    className="border-blue-200 hover:bg-blue-50 text-blue-600 font-['Fredoka']"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartDirectMessage(searchUser.id)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-['Fredoka']"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          
                          {userSearchQuery.trim() && searchUsers(userSearchQuery)
                            .filter(u => u.id !== user.id && !friends.includes(u.id) && !blockedUsers.includes(u.id)).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="font-['Fredoka']">No users found</p>
                              <p className="text-sm">Try a different search term</p>
                            </div>
                          )}
                          
                          {!userSearchQuery.trim() && (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="font-['Fredoka']">Search for users</p>
                              <p className="text-sm">Enter a name or username to find friends</p>
                              {allUsers.length > 0 && (
                                <p className="text-xs mt-2 text-green-600">{allUsers.length} users available</p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {friendUsers.map((friend) => (
                    <div
                      key={`friend-${friend.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                          {onlineUsers.includes(friend.id) && (
                            <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            @{friend.username}
                            {onlineUsers.includes(friend.id) && (
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                                Online
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartChat(friend.id)}
                          className="border-blue-200 hover:bg-blue-50 text-blue-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 hover:bg-gray-50 text-gray-600"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => removeFriend(friend.id)}
                              className="text-gray-700 cursor-pointer"
                            >
                              Remove Friend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => blockUser(friend.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              Block User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {friendUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No friends yet</p>
                      <p className="text-sm">Connect with other guitarists!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Blocked Users */}
          {blockedUserList.length > 0 && (
            <Card style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  Blocked Users ({blockedUserList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockedUserList.map((blockedUser) => (
                    <div
                      key={`blocked-${blockedUser.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden opacity-50">
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                        </div>
                        <div>
                          <p className="font-medium">{blockedUser.name}</p>
                          <p className="text-sm text-gray-500">@{blockedUser.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unblockUser(blockedUser.id)}
                        className="border-green-200 hover:bg-green-50 text-green-600"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}
      </div>
    );
  };

  // Messages view - chat with friends based on accepted requests
  const renderMessagesView = () => {
    // Get friends from accepted requests
    const friendUsers = allUsers.filter((u) => friends.includes(u.id));
    
    // Sort friends: those with recent chats/new friendships first
    const sortedFriendUsers = [...friendUsers].sort((a, b) => {
      const chatA = chats.find(c => c.type === 'private' && c.participants.includes(a.id) && c.participants.includes(user.id));
      const chatB = chats.find(c => c.type === 'private' && c.participants.includes(b.id) && c.participants.includes(user.id));
      
      // Prioritize friends with existing chats (recently created)
      if (chatA && !chatB) return -1;
      if (!chatA && chatB) return 1;
      if (chatA && chatB) {
        return new Date(chatB.updatedAt || chatB.createdAt).getTime() - new Date(chatA.updatedAt || chatA.createdAt).getTime();
      }
      return 0;
    });

    return (
      <div className="space-y-6">
        {/* Messages Header */}
        <Card style={{ border: '2.5px solid rgb(237, 237, 237)' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Messages
              {friendUsers.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white">
                  {friendUsers.length} {friendUsers.length === 1 ? 'friend' : 'friends'}
                </Badge>
              )}
              {selectedChat && (
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to friends
                </button>
              )}
              </CardTitle>
            </CardHeader>
            <CardContent>
            {/* Friend List View - when no chat is selected */}
            {!selectedChat ? (
              <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                  {sortedFriendUsers.map((friend) => {
                    // Find existing chat with this friend
                    const existingChat = chats.find(
                      (chat) => chat.type === 'private' && 
                        chat.participants.includes(friend.id) && 
                        chat.participants.includes(user.id)
                    );
                    const chatMessages = existingChat ? getChatMessages(existingChat.id) : [];
                    const lastMessage = chatMessages[chatMessages.length - 1];
                    
                    // Check if this is a new friend (chat created in last 24 hours or no messages yet)
                    const isNewFriend = existingChat && (
                      (new Date().getTime() - new Date(existingChat.createdAt).getTime()) < 24 * 60 * 60 * 1000 ||
                      chatMessages.filter(m => m.type !== 'system').length === 0
                    );
                    
                    // Check for unread messages (messages after last visit - simplified check)
                    const hasUnreadMessages = chatMessages.length > 0 && 
                      lastMessage?.senderId !== user.id && 
                      lastMessage?.type !== 'system';

                  return (
                    <div
                        key={`friend-msg-${friend.id}`}
                        onClick={() => handleStartChat(friend.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                          isNewFriend 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                            {onlineUsers.includes(friend.id) && (
                            <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {friend.name}
                            </p>
                              {isNewFriend && (
                                <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                                  New
                                </Badge>
                              )}
                              {hasUnreadMessages && !isNewFriend && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate max-w-[250px]">
                              {lastMessage 
                                ? lastMessage.type === 'system' 
                                  ? 'Start chatting!' 
                                  : lastMessage.content 
                                : 'Tap to start chatting...'}
                            </p>
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                          {onlineUsers.includes(friend.id) && (
                            <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                              Online
                      </Badge>
                          )}
                          <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                  );
                })}

                  {friendUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium mb-2">No friends yet</p>
                      <p className="text-sm mb-4">Accept friend requests to start messaging!</p>
                  <Button 
                        onClick={() => setActiveView("friends")}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                        <Users className="w-4 h-4 mr-2" />
                        Go to Friends
                  </Button>
                    </div>
                                  )}
                                </div>
              </ScrollArea>
            ) : (
              /* Full Chat View - when a friend is selected */
              <div className="h-[500px] flex flex-col">
                {(() => {
                  const currentChat = chats.find((c) => c.id === selectedChat);
                  const otherParticipantId = currentChat?.participants.find((p) => p !== user.id);
                  const chatPartner = otherParticipantId ? allUsers.find((u) => u.id === otherParticipantId) : null;

                  return (
                    <>
                      {/* Chat Header */}
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-t-xl border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover scale-110" />
                          {otherParticipantId && onlineUsers.includes(otherParticipantId) && (
                            <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                          )}
                          </div>
                        <div>
                          <p className="font-medium">
                            {chatPartner?.name || currentChat?.participantNames?.find(n => n !== user.name) || 'Chat'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {otherParticipantId && onlineUsers.includes(otherParticipantId) ? 'Online' : 'Offline'}
                          </p>
                      </div>
                  </div>

                      {/* Messages Area - Takes remaining space */}
                      <ScrollArea className="flex-1 p-4 bg-white dark:bg-gray-800">
              <div className="space-y-3">
                          {directChatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex flex-col ${message.senderId === user.id ? "items-end" : "items-start"}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                  message.senderId === user.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className={`text-xs text-gray-400 mt-1 ${message.senderId === user.id ? "mr-1" : "ml-1"}`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))}

                          {directChatMessages.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="font-medium">No messages yet</p>
                              <p className="text-sm">Say hello to start the conversation!</p>
                  </div>
                )}
              </div>
            </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl">
                        <div className="flex gap-3">
                          <Input
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="flex-1 border-gray-200 focus:border-blue-400 rounded-xl h-11"
                          />
                    <Button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11 px-6"
                          >
                            <Send className="w-5 h-5" />
                    </Button>
                  </div>
              </div>
                    </>
                  );
                })()}
              </div>
            )}
            </CardContent>
          </Card>
      </div>
    );
  };

  const renderActiveView = () => {
    try {
      switch (activeView) {
        case "discover":
          return renderDiscoverView();
        case "friends":
          return renderFriendsView();
        case "messages":
          return renderMessagesView();
        case "jamroom":
          return renderJamRoomView();
        default:
          return renderDiscoverView();
      }
    } catch (error) {
      console.error("Error rendering active view:", error);
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <X className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please try refreshing the page or switching to a different tab.
            </p>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="page-content">
      <div className="container mx-auto px-4 py-6">
        {renderNavigation()}
        {renderActiveView()}
      </div>

      {/* Community Guidelines Warning Dialog */}
      <Dialog open={showCommunityWarning} onOpenChange={() => {}}>
        <DialogContent
          className="p-0 overflow-hidden rounded-2xl"
          style={{
            width: 'calc(100% - 1rem)', maxWidth: '28rem',
            border: '3px solid rgb(239, 68, 68)',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          aria-describedby="community-guidelines-description"
        >
          {/* Header */}
          <div
            className="px-6 py-5 text-center"
            style={{
              background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 50%, #FCA5A5 100%)'
            }}
          >
            <div
              className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgb(239, 68, 68)',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold text-red-700 mb-2">Community Guidelines</DialogTitle>
              <DialogDescription id="community-guidelines-description" className="text-red-600 font-medium text-base">
                Please read before continuing
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <Shield className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-base mb-1">Zero Tolerance Policy</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We have zero tolerance for foul language, harassment, bullying, or any form of inappropriate behavior.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-base mb-1">Consequences</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Violations will result in immediate action including warnings, temporary suspensions, or permanent bans.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Users className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-base mb-1">Respect Others</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Treat all community members with respect. This is a safe space for guitarists of all skill levels.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                By clicking "I Understand & Agree", you acknowledge that you have read and agree to follow our community guidelines.
                Violations may result in account termination.
              </p>
            </div>

            <button
              onClick={handleAcceptCommunityGuidelines}
              className="w-full mt-5 py-3 px-6 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                border: '2px solid #059669',
                borderBottom: '4px solid #047857'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                I Understand & Agree
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}