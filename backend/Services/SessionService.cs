using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace BingGoWebAPI.Services;

public interface ISessionService
{
    Task<bool> IsSessionValidAsync(string userId, string sessionId);
    Task CreateSessionAsync(string userId, string sessionId, TimeSpan? expiry = null);
    Task InvalidateSessionAsync(string userId, string sessionId);
    Task InvalidateAllUserSessionsAsync(string userId);
    Task<Dictionary<string, object>> GetSessionDataAsync(string userId, string sessionId);
    Task SetSessionDataAsync(string userId, string sessionId, string key, object value);
    Task UpdateLastActivityAsync(string userId, string sessionId);
    Task<List<SessionInfo>> GetActiveSessionsAsync(string userId);
}

public class SessionInfo
{
    public string SessionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastActivity { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
}

public class SessionService : ISessionService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<SessionService> _logger;
    private readonly TimeSpan _defaultSessionExpiry = TimeSpan.FromHours(24);
    private readonly string _sessionPrefix = "session:";
    private readonly string _userSessionsPrefix = "user_sessions:";

    public SessionService(IMemoryCache cache, ILogger<SessionService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public Task<bool> IsSessionValidAsync(string userId, string sessionId)
    {
        try
        {
            var sessionKey = GetSessionKey(userId, sessionId);
            if (_cache.TryGetValue(sessionKey, out _))
            {
                UpdateLastActivityAsync(userId, sessionId);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating session for user {UserId}, session {SessionId}", userId, sessionId);
            return Task.FromResult(false);
        }
    }

    public Task CreateSessionAsync(string userId, string sessionId, TimeSpan? expiry = null)
    {
        try
        {
            var sessionExpiry = expiry ?? _defaultSessionExpiry;
            var sessionKey = GetSessionKey(userId, sessionId);
            var userSessionsKey = GetUserSessionsKey(userId);

            var sessionInfo = new SessionInfo
            {
                SessionId = sessionId,
                CreatedAt = DateTime.UtcNow,
                LastActivity = DateTime.UtcNow
            };

            var sessionData = new Dictionary<string, object>
            {
                ["info"] = sessionInfo,
                ["data"] = new Dictionary<string, object>()
            };

            _cache.Set(sessionKey, sessionData, sessionExpiry);

            var userSessions = _cache.Get<List<string>>(userSessionsKey) ?? new List<string>();
            if (!userSessions.Contains(sessionId))
            {
                userSessions.Add(sessionId);
                _cache.Set(userSessionsKey, userSessions, sessionExpiry);
            }

            _logger.LogInformation("Created session {SessionId} for user {UserId}", sessionId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating session for user {UserId}, session {SessionId}", userId, sessionId);
            throw;
        }
        return Task.CompletedTask;
    }

    public Task InvalidateSessionAsync(string userId, string sessionId)
    {
        try
        {
            var sessionKey = GetSessionKey(userId, sessionId);
            var userSessionsKey = GetUserSessionsKey(userId);

            _cache.Remove(sessionKey);

            if (_cache.TryGetValue(userSessionsKey, out List<string>? userSessions) && userSessions != null)
            {
                userSessions.Remove(sessionId);
                _cache.Set(userSessionsKey, userSessions);
            }

            _logger.LogInformation("Invalidated session {SessionId} for user {UserId}", sessionId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating session for user {UserId}, session {SessionId}", userId, sessionId);
            throw;
        }
        return Task.CompletedTask;
    }

    public Task InvalidateAllUserSessionsAsync(string userId)
    {
        try
        {
            var userSessionsKey = GetUserSessionsKey(userId);
            if (_cache.TryGetValue(userSessionsKey, out List<string>? userSessions) && userSessions != null)
            {
                foreach (var sessionId in userSessions)
                {
                    var sessionKey = GetSessionKey(userId, sessionId);
                    _cache.Remove(sessionKey);
                }
                _cache.Remove(userSessionsKey);
            }

            _logger.LogInformation("Invalidated all sessions for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating all sessions for user {UserId}", userId);
            throw;
        }
        return Task.CompletedTask;
    }

    public Task<Dictionary<string, object>> GetSessionDataAsync(string userId, string sessionId)
    {
        try
        {
            var sessionKey = GetSessionKey(userId, sessionId);
            if (_cache.TryGetValue(sessionKey, out object? sessionContainer) && sessionContainer is Dictionary<string, object> container)
            {
                if (container.TryGetValue("data", out object? data) && data is Dictionary<string, object> sessionData)
                {
                    return Task.FromResult(sessionData);
                }
            }
            return Task.FromResult(new Dictionary<string, object>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting session data for user {UserId}, session {SessionId}", userId, sessionId);
            return Task.FromResult(new Dictionary<string, object>());
        }
    }

    public Task SetSessionDataAsync(string userId, string sessionId, string key, object value)
    {
        try
        {
            var sessionKey = GetSessionKey(userId, sessionId);
            if (_cache.TryGetValue(sessionKey, out object? sessionContainer) && sessionContainer is Dictionary<string, object> container)
            {
                if (container.TryGetValue("data", out object? data) && data is Dictionary<string, object> sessionData)
                {
                    sessionData[key] = value;
                    _cache.Set(sessionKey, container);
                    UpdateLastActivityAsync(userId, sessionId);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting session data for user {UserId}, session {SessionId}", userId, sessionId);
            throw;
        }
        return Task.CompletedTask;
    }

    public Task UpdateLastActivityAsync(string userId, string sessionId)
    {
        try
        {
            var sessionKey = GetSessionKey(userId, sessionId);
            if (_cache.TryGetValue(sessionKey, out object? sessionContainer) && sessionContainer is Dictionary<string, object> container)
            {
                if (container.TryGetValue("info", out object? info) && info is SessionInfo sessionInfo)
                {
                    sessionInfo.LastActivity = DateTime.UtcNow;
                    _cache.Set(sessionKey, container);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating last activity for user {UserId}, session {SessionId}", userId, sessionId);
        }
        return Task.CompletedTask;
    }

    public Task<List<SessionInfo>> GetActiveSessionsAsync(string userId)
    {
        try
        {
            var userSessionsKey = GetUserSessionsKey(userId);
            var activeSessions = new List<SessionInfo>();

            if (_cache.TryGetValue(userSessionsKey, out List<string>? userSessions) && userSessions != null)
            {
                foreach (var sessionId in userSessions)
                {
                    var sessionKey = GetSessionKey(userId, sessionId);
                    if (_cache.TryGetValue(sessionKey, out object? sessionContainer) && sessionContainer is Dictionary<string, object> container)
                    {
                        if (container.TryGetValue("info", out object? info) && info is SessionInfo sessionInfo)
                        {
                            activeSessions.Add(sessionInfo);
                        }
                    }
                }
            }
            return Task.FromResult(activeSessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active sessions for user {UserId}", userId);
            return Task.FromResult(new List<SessionInfo>());
        }
    }

    private string GetSessionKey(string userId, string sessionId)
    {
        return $"{_sessionPrefix}{userId}:{sessionId}";
    }

    private string GetUserSessionsKey(string userId)
    {
        return $"{_userSessionsPrefix}{userId}";
    }
}