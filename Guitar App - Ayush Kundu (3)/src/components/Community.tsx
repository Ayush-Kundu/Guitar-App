import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
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
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  Users,
  MessageCircle,
  Heart,
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
} from "lucide-react";

export function Community() {
  const {
    user,
    friends,
    friendRequests,
    chats,
    communityPosts,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    createChat,
    sendMessage,
    getChatMessages,
    createCommunityPost,
    likeCommunityPost,
    allUsers,
    onlineUsers,
    isConnected,
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

  if (!user) {
    return null;
  }

  const searchResults = searchUsers(searchQuery);
  const friendUsers = allUsers.filter((u) => friends.includes(u.id));
  const pendingRequests = friendRequests.filter((req) => req.status === "pending");
  const receivedRequests = pendingRequests.filter((req) => req.toUserId === user.id);
  const sentRequests = pendingRequests.filter((req) => req.fromUserId === user.id);

  const handleSendFriendRequest = async (username: string) => {
    try {
      await sendFriendRequest(username);
      setSearchQuery("");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !messageInput.trim()) return;

    try {
      await sendMessage(selectedChat, messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  const renderNavigation = () => (
    <div className="mb-8">
      {/* The Daily Guitarist Header */}
      <div className="daily-guitarist-header bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 text-center">
        <h1
          className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-2"
          style={{
            fontFamily: 'Times, "Times New Roman", serif',
          }}
        >
          The Daily Guitarist
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Where Strings Meet Stories
        </p>
      </div>

      {/* Compact Navigation Bar with Sliding Animation */}
      <div className="community-navbar bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-lg relative overflow-hidden">
        <div ref={tabsListRef} className="flex items-center relative">
          {/* Sliding background with fade animation */}
          <div
            className="absolute top-1 bottom-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-md transition-all duration-300 ease-out shadow-md opacity-0 animate-fade-in"
            style={{
              left: `${sliderStyle.left + 4}px`,
              width: `${sliderStyle.width - 8}px`,
              opacity: sliderStyle.width > 0 ? 1 : 0,
            }}
          />

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                data-value={item.id}
                onClick={() => setActiveView(item.id)}
                className="community-nav-item flex-1 relative px-6 py-3 transition-all duration-300 group z-10"
              >
                <div className="flex items-center justify-center">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive
                        ? "text-white scale-110"
                        : "text-gray-500 group-hover:text-orange-500 group-hover:scale-110"
                    }`}
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.label}
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
    <div className="space-y-6">
      {/* Enhanced Create Post */}
      <Card className="border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-lg relative group">
              {user.avatar}
              <div className="absolute inset-0 rounded-full bg-orange-300 animate-ping opacity-20 group-hover:opacity-40"></div>
            </div>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder={`What's your guitar story today, ${user.name}? Share a breakthrough, ask for advice, or celebrate your progress! 🎸`}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600 transition-all duration-300 focus:shadow-lg"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-gray-600 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Target className="w-3 h-3 mr-1" />
                    {user.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{onlineUsers.length} online</span>
                  </div>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!postContent.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Journey
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Posts */}
      <div className="space-y-4">
        {communityPosts.map((post, index) => (
          <Card
            key={`community-post-${post.id}-${index}`}
            className="community-post-card hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white relative shrink-0">
                  {post.avatar}
                  {onlineUsers.includes(post.userId) && (
                    <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {post.userName}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatTime(post.timestamp)}
                    </span>
                  </div>

                  <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed text-sm">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => likeCommunityPost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 text-xs ${
                        post.hasLiked
                          ? "text-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm"
                          : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          post.hasLiked ? "fill-current scale-110" : "hover:scale-110"
                        }`}
                      />
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105 hover:shadow-sm text-xs">
                      <MessageCircle className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110" />
                      <span className="font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:scale-105 hover:shadow-sm text-xs">
                      <Share2 className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110" />
                      <span className="font-medium">{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMessagesView = () => {
    if (selectedChat) {
      const chat = chats.find((c) => c.id === selectedChat);
      const messages = getChatMessages(selectedChat);

      return (
        <Card className="h-[700px] flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-4 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChat(null)}
                className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {chat?.type === "group"
                    ? chat.name
                    : chat?.participantNames.filter((name) => name !== user.name)[0] || "Chat"}
                </h3>
                <p className="text-sm text-gray-500">
                  {chat?.type === "group"
                    ? `${chat.participants.length} members`
                    : "Private conversation"}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={`chat-message-${message.id}`}
                  className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-4 ${
                      message.type === "system"
                        ? "bg-gray-100 dark:bg-gray-700 text-center text-sm text-gray-600 dark:text-gray-400 mx-auto"
                        : message.senderId === user.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.type !== "system" && message.senderId !== user.id && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                        {message.senderName}
                      </p>
                    )}
                    <p className="leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.type === "system"
                          ? "text-gray-500"
                          : message.senderId === user.id
                          ? "text-orange-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-6 border-t border-orange-200 dark:border-orange-800">
            <div className="flex gap-3">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 border-orange-200 dark:border-orange-800 focus:border-orange-400 dark:focus:border-orange-600"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Conversations</CardTitle>
              <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="border-orange-200 dark:border-orange-800"
                    />
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select friends:</p>
                      {friendUsers.map((friend) => (
                        <div key={`group-friend-${friend.id}`} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`group-checkbox-${friend.id}`}
                            checked={selectedFriends.includes(friend.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFriends((prev) => [...prev, friend.id]);
                              } else {
                                setSelectedFriends((prev) => prev.filter((id) => id !== friend.id));
                              }
                            }}
                            className="rounded"
                          />
                          <label
                            htmlFor={`group-checkbox-${friend.id}`}
                            className="text-sm flex items-center gap-2"
                          >
                            {friend.name} (@{friend.username})
                            {onlineUsers.includes(friend.id) && (
                              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={!groupName.trim() || selectedFriends.length === 0}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {chats
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                  )
                  .map((chat) => (
                    <div
                      key={`chat-list-${chat.id}`}
                      onClick={() => setSelectedChat(chat.id)}
                      className="p-4 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-orange-800 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                          {chat.type === "group" ? (
                            <Hash className="w-6 h-6" />
                          ) : (
                            <MessageCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {chat.type === "group"
                              ? chat.name
                              : chat.participantNames.filter((name) => name !== user.name)[0] ||
                                "Chat"}
                          </p>
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {chat.lastMessage.senderName === user.name ? "You: " : ""}
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                {chats.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-sm">Start chatting with your guitar friends!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Friends Section */}
        <div className="space-y-6">
          {/* Friend Requests */}
          {receivedRequests.length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Friend Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receivedRequests.map((request) => (
                    <div
                      key={`friend-request-${request.id}`}
                      className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                          🎸
                        </div>
                        <div>
                          <p className="font-medium">{request.fromUserName}</p>
                          <p className="text-sm text-gray-500">@{request.fromUsername}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineFriendRequest(request.id)}
                          className="border-red-200 hover:bg-red-50 text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Friends ({friendUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {friendUsers.map((friend) => (
                    <div
                      key={`friend-${friend.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white relative">
                          {friend.avatar}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartChat(friend.id)}
                        className="border-blue-200 hover:bg-blue-50 text-blue-600"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
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
        </div>
      </div>
    );
  };

  const renderJamRoomView = () => (
    <div className="space-y-6">
      <Card className="border-purple-200 dark:border-purple-800">
        <CardContent className="p-8 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-xl font-semibold mb-2">Jam Room Coming Soon!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect with fellow guitarists for live jam sessions, virtual concerts, and collaborative music-making.
          </p>
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <Sparkles className="w-3 h-3 mr-1" />
            In Development
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveView = () => {
    try {
      switch (activeView) {
        case "discover":
          return renderDiscoverView();
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
    </div>
  );
}