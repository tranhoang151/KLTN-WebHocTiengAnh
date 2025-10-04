using BingGoWebAPI.Models;

namespace BingGoWebAPI.Services
{
    public interface IOptimizedFirebaseService
    {
        Task<T?> GetCachedDocumentAsync<T>(string collection, string documentId) where T : class;
        Task<List<T>> GetCachedCollectionAsync<T>(string collection) where T : class;
        Task InvalidateCacheAsync(string collection, string documentId);
        Task InvalidateCollectionCacheAsync(string collection);
        Task<T?> GetDocumentWithCacheAsync<T>(string collection, string documentId) where T : class;
        Task BatchWriteAsync(List<BatchOperation> operations);
        Task<List<T>> GetCollectionWithPaginationAsync<T>(string collection, int pageSize, string? startAfter = null) where T : class;
    }

    public class BatchOperation
    {
        public string Operation { get; set; } = string.Empty; // "create", "update", "delete"
        public string Collection { get; set; } = string.Empty;
        public string DocumentId { get; set; } = string.Empty;
        public object? Data { get; set; }
    }
}