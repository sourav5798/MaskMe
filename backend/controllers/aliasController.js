import Alias from "../models/Alias.js";
import generateAlias from "../utils/generateAlias.js";
import { getAliasMeta } from "../utils/aliasHelpers.js";

export const createAlias = async (req, res) => {
  try {
    const now = Date.now();

    // expiryDuration is provided by the client in milliseconds (e.g. 1h, 6h, 24h, 7d)
    const expiryDuration =
      typeof req.body.expiryDuration === "number" && req.body.expiryDuration > 0
        ? req.body.expiryDuration
        : 3600000; // fallback to 1 hour if not provided

    const expiresAt = new Date(now + expiryDuration);

    // Generate anonymous session ID if not provided
    // Headers are case-insensitive in Express, but check both formats
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'] || `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const alias = await Alias.create({
      alias: generateAlias(sessionId),
      userId: sessionId, // Use session ID instead of user ID
      type: req.body.type,
      createdAt: new Date(now),
      expiresAt,
      expiryDuration,
      isPremium: false,
    });

    const meta = getAliasMeta(alias);

    res.json({ ...alias.toObject(), ...meta });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAliases = async (req, res) => {
  try {
    // Get session ID from header or use a default
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'];
    
    // If no session ID, return empty array (or all aliases - depends on requirement)
    // For anonymous use, we'll store session in localStorage on frontend
    const query = sessionId ? { userId: sessionId } : {};
    
    const aliases = await Alias.find(query).sort({ createdAt: -1 }).limit(100);

    const enrichedAliases = aliases.map((alias) => {
      const meta = getAliasMeta(alias);
      return { ...alias.toObject(), ...meta };
    });

    res.json(enrichedAliases);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAlias = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'];

    // Delete alias - if session ID provided, only delete if it matches
    const query = sessionId 
      ? { _id: id, userId: sessionId }
      : { _id: id };

    const alias = await Alias.findOneAndDelete(query);

    if (!alias) {
      return res
        .status(404)
        .json({ error: "Alias not found" });
    }

    return res.json({ success: true, message: "Alias deleted" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAliasStats = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'];
    const query = sessionId ? { userId: sessionId } : {};
    
    const aliases = await Alias.find(query);

    const metas = aliases.map((alias) => getAliasMeta(alias));

    const totalCreated = metas.length;
    const expiredCount = metas.filter((m) => m.isExpired).length;
    const activeCount = totalCreated - expiredCount;

    res.json({
      totalCreated,
      activeCount,
      expiredCount,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

