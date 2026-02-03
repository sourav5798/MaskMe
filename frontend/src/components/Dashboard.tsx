import { motion, AnimatePresence } from "motion/react";
import { Plus, User, Mail, Phone, Zap, Copy, Trash2, Clock } from "lucide-react";
import { Button } from "./Button";
import { NebulaBackground } from "./NebulaBackground";
import { GlassCard } from "./GlassCard";
import { StatusBadge } from "./StatusBadge";
import { Toast } from "./Toast";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { socketService } from "../services/socket";

interface Alias {
  _id: string;
  alias?: string;
  phone?: string;
  type: "email" | "phone";
  status: string;
  timeRemaining: number;
  isExpired: boolean;
  logsCount?: number;
}

interface Message {
  _id: string;
  type: "otp" | "message";
  sender: string;
  content: string;
  receivedAt: string;
  aliasId: string;
}

const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatTimeAgo = (date: string): string => {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [emailAliases, setEmailAliases] = useState<Alias[]>([]);
  const [phoneAliases, setPhoneAliases] = useState<Alias[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [expiryTime, setExpiryTime] = useState("24 hours");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const expiryMap: Record<string, number> = {
    "1 hour": 3600000,
    "6 hours": 21600000,
    "12 hours": 43200000,
    "24 hours": 86400000,
  };

  useEffect(() => {
    loadAliases();
  }, []);

  useEffect(() => {
    // Load messages when aliases change
    if (emailAliases.length > 0 || phoneAliases.length > 0) {
      loadMessages();
    }
  }, [emailAliases.length, phoneAliases.length]);

  useEffect(() => {
    // Connect to Socket.io for real-time notifications
    socketService.connect();
    
    // Listen for notifications
    const handleNotification = (data: { aliasId: string; message: any; timestamp: string }) => {
      loadMessages(); // Reload messages when notification arrives
      showToastMessage("New message received!", "success");
    };

    socketService.onNotification(handleNotification);

    return () => {
      socketService.offNotification(handleNotification);
    };
  }, []);

  useEffect(() => {
    // Join all alias rooms when aliases change
    if (emailAliases.length > 0 || phoneAliases.length > 0) {
      const allAliases = [...emailAliases, ...phoneAliases];
      allAliases.forEach(alias => {
        socketService.joinAlias(alias._id);
      });
    }
  }, [emailAliases.length, phoneAliases.length]);

  const loadAliases = async () => {
    try {
      setLoading(true);
      const aliases = await apiService.getAliases();
      const emails = aliases.filter((a: Alias) => a.type === "email");
      const phones = aliases.filter((a: Alias) => a.type === "phone");
      setEmailAliases(emails);
      setPhoneAliases(phones);
    } catch (error: any) {
      showToastMessage(error.message || "Failed to load aliases", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      // Load messages for all aliases
      const allAliases = [...emailAliases, ...phoneAliases];
      const allMessages: Message[] = [];
      
      for (const alias of allAliases) {
        try {
          const aliasMessages = await apiService.getOTP(alias._id);
          allMessages.push(...aliasMessages.map((msg: any) => ({
            ...msg,
            type: msg.otp ? ("otp" as const) : ("message" as const),
          })));
        } catch (err) {
          // Ignore errors for individual alias messages
        }
      }
      
      setMessages(allMessages.sort((a, b) => 
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      ));
    } catch (error) {
      // Silently fail for messages
    }
  };

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleCreateEmailAlias = async () => {
    try {
      setCreating(true);
      const expiryDuration = expiryMap[expiryTime] || expiryMap["24 hours"];
      const newAlias = await apiService.createAlias("email", expiryDuration);
      await loadAliases();
      showToastMessage("Email alias created successfully!");
    } catch (error: any) {
      showToastMessage(error.message || "Failed to create alias", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePhoneAlias = async () => {
    try {
      setCreating(true);
      const expiryDuration = expiryMap[expiryTime] || expiryMap["24 hours"];
      const newAlias = await apiService.createAlias("phone", expiryDuration);
      await loadAliases();
      showToastMessage("Phone alias created successfully!");
    } catch (error: any) {
      showToastMessage(error.message || "Failed to create alias", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToastMessage("Copied to clipboard!");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setCopiedId(null);
    }, 2500);
  };

  const handleDelete = async (id: string, type: "email" | "phone") => {
    setDeletedId(id);
    try {
      await apiService.deleteAlias(id);
      await loadAliases();
      showToastMessage("Alias deleted");
    } catch (error: any) {
      showToastMessage(error.message || "Failed to delete alias", "error");
      setDeletedId(null);
    }
  };

  const activeEmailCount = emailAliases.filter(a => !a.isExpired).length;
  const activePhoneCount = phoneAliases.filter(a => !a.isExpired).length;

  return (
    <div className="w-[900px] h-[700px] relative overflow-hidden bg-[#0D0D0D] flex">
      {/* Nebula Background */}
      <NebulaBackground />

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-hidden flex">
        {/* Left Section - Alias Management */}
        <div className="flex-1 overflow-auto">
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 0.78, 0.43, 1] }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-gradient mb-1">MaskMe</h1>
                <p className="text-xs text-[#9CA3AF]">Hide Your Presence</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-sm text-[#9CA3AF]">
                {activeTab === "email" ? (
                  <>
                    <span className="text-[#5CE1E6]">{activeEmailCount} active</span> {activeTab}s
                  </>
                ) : (
                  <>
                    <span className="text-[#5CE1E6]">{activePhoneCount} active</span> {activeTab}s
                  </>
                )}
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
              <motion.button
                onClick={() => setActiveTab("email")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === "email"
                    ? "bg-gradient-to-r from-[#6C63FF]/30 to-[#5CE1E6]/30 text-white"
                    : "text-[#9CA3AF]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("phone")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === "phone"
                    ? "bg-gradient-to-r from-[#6C63FF]/30 to-[#5CE1E6]/30 text-white"
                    : "text-[#9CA3AF]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">Phone</span>
              </motion.button>
            </div>

            {/* Expiry Selector */}
            <div className="mb-4">
              <label className="text-xs text-[#9CA3AF] mb-2 block">Expires In</label>
              <select
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-lg text-[#EDEDED] text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-colors"
              >
                <option value="24 hours">24 hours</option>
                <option value="12 hours">12 hours</option>
                <option value="6 hours">6 hours</option>
                <option value="1 hour">1 hour</option>
              </select>
            </div>

            {/* Create Button */}
            <motion.button
              onClick={activeTab === "email" ? handleCreateEmailAlias : handleCreatePhoneAlias}
              disabled={creating}
              className="w-full py-4 mb-6 bg-gradient-to-r from-[#6C63FF] to-[#5CE1E6] rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={creating ? {} : { scale: 1.02 }}
              whileTap={creating ? {} : { scale: 0.98 }}
              animate={creating ? {} : {
                boxShadow: [
                  "0 0 20px rgba(108, 99, 255, 0.4)",
                  "0 0 30px rgba(92, 225, 230, 0.6)",
                  "0 0 20px rgba(108, 99, 255, 0.4)",
                ],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity },
              }}
            >
              <Zap className="w-5 h-5" />
              {creating ? "Creating..." : (activeTab === "email" ? "Create New Alias" : "Create Phone Alias")}
            </motion.button>

            {/* Recent Aliases */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[#EDEDED]">
                  {activeTab === "email" ? "Recent Email Aliases" : "Recent Phone Aliases"}
                </h3>
                <button
                  onClick={() => {
                    const value = activeTab === "email" ? emailAliases[0]?.email : phoneAliases[0]?.phone;
                    const id = activeTab === "email" ? emailAliases[0]?.id : phoneAliases[0]?.id;
                    if (value && id) handleCopy(value, id);
                  }}
                  className="text-xs text-[#5CE1E6] hover:text-[#4AC5CA] transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Simulate Incoming OTP
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "email" ? (
                  <motion.div
                    key="email-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {loading ? (
                      <div className="text-center py-12">
                        <p className="text-sm text-[#9CA3AF]">Loading aliases...</p>
                      </div>
                    ) : emailAliases.length === 0 ? (
                      <div className="text-center py-12">
                        <Mail className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-[#9CA3AF]">No email aliases yet</p>
                      </div>
                    ) : (
                      emailAliases.map((alias, index) => (
                        <motion.div
                          key={alias._id}
                          className="glass-card p-4 flex items-center justify-between group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.07 }}
                          whileHover={{ scale: 1.01, boxShadow: "0 8px 24px rgba(108, 99, 255, 0.2)" }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#5CE1E6] flex items-center justify-center">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-[#EDEDED] mb-1 font-mono">{alias.alias}</p>
                              <p className="text-xs text-[#9CA3AF]">email alias</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <StatusBadge status={alias.isExpired ? "Expired" : "Active"} />
                            
                            <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                              <Clock className="w-3 h-3" />
                              {formatTimeRemaining(alias.timeRemaining)}
                            </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => handleCopy(alias.alias || "", alias._id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <motion.div
                                animate={copiedId === alias._id ? {
                                  scale: [1, 1.3, 1],
                                  rotate: [0, 15, -15, 0],
                                } : {}}
                                transition={{ duration: 0.4 }}
                              >
                                <Copy className="w-4 h-4 text-[#5CE1E6]" />
                              </motion.div>
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(alias._id, "email")}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <motion.div
                                animate={deletedId === alias._id ? {
                                  scale: [1, 1.3, 0],
                                  rotate: [0, 0, 180],
                                  opacity: [1, 1, 0],
                                } : {}}
                                transition={{ duration: 0.3 }}
                              >
                                <Trash2 className="w-4 h-4 text-[#EF4444]" />
                              </motion.div>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="phone-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {loading ? (
                      <div className="text-center py-12">
                        <p className="text-sm text-[#9CA3AF]">Loading aliases...</p>
                      </div>
                    ) : phoneAliases.length === 0 ? (
                      <div className="text-center py-12">
                        <Phone className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-[#9CA3AF]">No phone aliases yet</p>
                      </div>
                    ) : (
                      phoneAliases.map((alias, index) => (
                        <motion.div
                          key={alias._id}
                          className="glass-card p-4 flex items-center justify-between group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.07 }}
                          whileHover={{ scale: 1.01, boxShadow: "0 8px 24px rgba(108, 99, 255, 0.2)" }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#5CE1E6] flex items-center justify-center">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-[#EDEDED] mb-1 font-mono">{alias.phone || alias.alias}</p>
                              <p className="text-xs text-[#9CA3AF]">phone alias</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <StatusBadge status={alias.isExpired ? "Expired" : "Active"} />
                            
                            <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                              <Clock className="w-3 h-3" />
                              {formatTimeRemaining(alias.timeRemaining)}
                            </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => handleCopy(alias.phone || alias.alias || "", alias._id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <motion.div
                                animate={copiedId === alias._id ? {
                                  scale: [1, 1.3, 1],
                                  rotate: [0, 15, -15, 0],
                                } : {}}
                                transition={{ duration: 0.4 }}
                              >
                                <Copy className="w-4 h-4 text-[#5CE1E6]" />
                              </motion.div>
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(alias._id, "phone")}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <motion.div
                                animate={deletedId === alias._id ? {
                                  scale: [1, 1.3, 0],
                                  rotate: [0, 0, 180],
                                  opacity: [1, 1, 0],
                                } : {}}
                                transition={{ duration: 0.3 }}
                              >
                                <Trash2 className="w-4 h-4 text-[#EF4444]" />
                              </motion.div>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Section - Messages/OTPs */}
        <motion.div
          className="w-72 border-l border-white/10 overflow-auto"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.23, 0.78, 0.43, 1] }}
        >
          <div className="p-6">
            {/* Messages Header */}
            <div className="mb-6">
              <h3 className="text-sm mb-1">Incoming Messages</h3>
              <p className="text-xs text-[#9CA3AF]">{messages.length} new</p>
            </div>

            {/* Messages List */}
            <div className="space-y-3">
              {messages.map((message, index) => {
                const alias = [...emailAliases, ...phoneAliases].find(a => a._id === message.aliasId);
                return (
                  <motion.div
                    key={message._id}
                    className="glass-card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(92, 225, 230, 0.2)" }}
                  >
                    {/* Message Type Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        message.type === "otp" 
                          ? "bg-[#6C63FF]/20 text-[#6C63FF]" 
                          : "bg-[#5CE1E6]/20 text-[#5CE1E6]"
                      }`}>
                        {message.type === "otp" ? "OTP" : "Message"}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">{formatTimeAgo(message.receivedAt)}</span>
                    </div>

                    {/* From */}
                    <p className="text-xs text-[#9CA3AF] mb-2">From: {message.sender}</p>

                    {/* Content */}
                    <p className="text-sm text-[#EDEDED] mb-2 break-words">{message.content}</p>

                    {/* Target Alias */}
                    <p className="text-xs text-[#5CE1E6] font-mono truncate">
                      → {alias?.alias || alias?.phone || "Unknown"}
                    </p>

                    {/* Copy Button */}
                    {message.type === "otp" && message.content.match(/\b\d{4,8}\b/) && (
                      <motion.button
                        onClick={() => {
                          const otpMatch = message.content.match(/\b\d{4,8}\b/);
                          if (otpMatch) handleCopy(otpMatch[0], message._id);
                        }}
                        className="w-full mt-3 px-3 py-2 bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30 rounded-lg text-xs text-[#6C63FF] transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={copiedId === message._id ? {
                            scale: [1, 1.3, 1],
                            rotate: [0, 15, -15, 0],
                          } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <Copy className="w-3 h-3" />
                        </motion.div>
                        Copy OTP
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4 opacity-50" />
                <p className="text-sm text-[#9CA3AF]">No messages yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <Toast isVisible={showToast} message={toastMessage} type={toastType} />
    </div>
  );
}
