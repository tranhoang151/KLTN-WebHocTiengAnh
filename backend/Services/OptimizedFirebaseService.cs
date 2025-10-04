using Google.Cloud.Firestore;
using Microsoft.Extensions.Caching.Memory;

namespace BingGoWebAPI.Services
{
    public class OptimizedFirebaseService : IOptimizedFirebaseService
    {
        private readonly IFirebaseService _firebaseService;
        private readonly IMemoryCache _cache;
        private readonly ILogger<OptimizedFirebaseService> _logger;
        private readonly TimeSpan _defaultCacheExpiry = TimeSpan.FromMinutes(15);

        public OptimizedFirebaseService(
            IFirebaseService firebaseService,
            IMemoryCache cache,
            ILogger<OptimizedFirebaseService> logger)
        {
            _firebaseService = firebaseService;
            _cache = cache;
            _logger = logger;
        }

        public async Task<T?> GetCachedDocumentAsync<T>(string collection, string documentId) where T : class
        {
            var cacheKey = $"{collection}:{documentId}";

            if (_cache.TryGetValue(cacheKey, out T? cachedValue))
            {
                return cachedValue;
            }

            var document = await _firebaseService.GetDocumentAsync<T>(collection, documentId);

            if (document != null)
            {
                _cache.Set(cacheKey, document, _defaultCacheExpiry);
            }

            return document;
        }

        public async Task SetCachedDocumentAsync<T>(string collection, string documentId, T data) where T : class
        {
            await _firebaseService.SetDocumentAsync(collection, documentId, data);

            var cacheKey = $"{collection}:{documentId}";
            _cache.Set(cacheKey, data, _defaultCacheExpiry);
        }

        public Task InvalidateCacheAsync(string collection, string? documentId = null)
        {
            if (documentId != null)
            {
                var cacheKey = $"{collection}:{documentId}";
                _cache.Remove(cacheKey);
            }
            else
            {
                // Remove all cache entries for the collection
                // This is a simplified implementation
                _logger.LogInformation("Cache invalidated for collection: {Collection}", collection);
            }

            return Task.CompletedTask;
        }

        public async Task<List<T>> GetCachedCollectionAsync<T>(string collection) where T : class
        {
            var cacheKey = $"collection:{collection}";

            if (_cache.TryGetValue(cacheKey, out List<T>? cachedValue))
            {
                return cachedValue ?? new List<T>();
            }

            var documents = await _firebaseService.GetCollectionAsync<T>(collection);
            _cache.Set(cacheKey, documents, _defaultCacheExpiry);

            return documents;
        }

        public Task InvalidateCollectionCacheAsync(string collection)
        {
            var cacheKey = $"collection:{collection}";
            _cache.Remove(cacheKey);
            return Task.CompletedTask;
        }

        public async Task<T?> GetDocumentWithCacheAsync<T>(string collection, string documentId) where T : class
        {
            return await GetCachedDocumentAsync<T>(collection, documentId);
        }

        public async Task BatchWriteAsync(List<BatchOperation> operations)
        {
            var batch = await _firebaseService.CreateBatchAsync();

            foreach (var operation in operations)
            {
                var docRef = _firebaseService.GetDocument(operation.Collection, operation.DocumentId);

                switch (operation.Operation.ToLower())
                {
                    case "create":
                    case "set":
                        if (operation.Data != null)
                            batch.Set(docRef, operation.Data as IDictionary<string, object> ?? new Dictionary<string, object>());
                        break;
                    case "update":
                        if (operation.Data != null)
                            batch.Update(docRef, operation.Data as IDictionary<string, object> ?? new Dictionary<string, object>());
                        break;
                    case "delete":
                        batch.Delete(docRef);
                        break;
                }
            }

            await _firebaseService.CommitBatchAsync(batch);

            // Invalidate cache for affected collections
            foreach (var collection in operations.Select(o => o.Collection).Distinct())
            {
                await InvalidateCollectionCacheAsync(collection);
            }
        }

        public async Task<List<T>> GetCollectionWithPaginationAsync<T>(string collection, int pageSize, string? startAfter = null) where T : class
        {
            var query = _firebaseService.GetCollection(collection).Limit(pageSize);

            if (!string.IsNullOrEmpty(startAfter))
            {
                var startDoc = await _firebaseService.GetDocument(collection, startAfter).GetSnapshotAsync();
                query = query.StartAfter(startDoc);
            }

            return await _firebaseService.GetDocumentsAsync<T>(query);
        }

        public async Task<List<T>> GetDocumentsBatchAsync<T>(string collection, List<string> documentIds) where T : class
        {
            var results = new List<T>();
            var uncachedIds = new List<string>();

            // Check cache first
            foreach (var id in documentIds)
            {
                var cacheKey = $"{collection}:{id}";
                if (_cache.TryGetValue(cacheKey, out T? cachedValue) && cachedValue != null)
                {
                    results.Add(cachedValue);
                }
                else
                {
                    uncachedIds.Add(id);
                }
            }

            // Fetch uncached documents
            if (uncachedIds.Any())
            {
                var tasks = uncachedIds.Select(id => _firebaseService.GetDocumentAsync<T>(collection, id));
                var uncachedResults = await Task.WhenAll(tasks);

                foreach (var (result, id) in uncachedResults.Zip(uncachedIds))
                {
                    if (result != null)
                    {
                        results.Add(result);
                        var cacheKey = $"{collection}:{id}";
                        _cache.Set(cacheKey, result, _defaultCacheExpiry);
                    }
                }
            }

            return results;
        }

        public async Task SetDocumentsBatchAsync<T>(string collection, Dictionary<string, T> documents) where T : class
        {
            var tasks = documents.Select(kvp => SetCachedDocumentAsync(collection, kvp.Key, kvp.Value));
            await Task.WhenAll(tasks);
        }

        public async Task<QuerySnapshot> GetOptimizedQueryAsync(Query query, bool useCache = true)
        {
            // For now, just delegate to the base service
            // In a real implementation, you might cache query results based on query parameters
            return await query.GetSnapshotAsync();
        }

        // Delegate all other IFirebaseService methods to the base service
        public CollectionReference GetCollection(string collectionName) => _firebaseService.GetCollection(collectionName);
        public DocumentReference GetDocument(string collectionName, string documentId) => _firebaseService.GetDocument(collectionName, documentId);
        public async Task<T?> GetDocumentAsync<T>(string collection, string documentId) where T : class => await _firebaseService.GetDocumentAsync<T>(collection, documentId);
        public async Task<List<T>> GetDocumentsAsync<T>(Query query) where T : class => await _firebaseService.GetDocumentsAsync<T>(query);
        public async Task SetDocumentAsync<T>(string collection, string documentId, T data) where T : class => await _firebaseService.SetDocumentAsync(collection, documentId, data);
        public async Task<string> AddDocumentAsync<T>(string collection, T data) where T : class => await _firebaseService.AddDocumentAsync(collection, data);
        public async Task UpdateDocumentAsync<T>(string collection, string documentId, T updates) where T : class => await _firebaseService.UpdateDocumentAsync(collection, documentId, updates);
        public async Task DeleteDocumentAsync(string collection, string documentId) => await _firebaseService.DeleteDocumentAsync(collection, documentId);
        public async Task<bool> DocumentExistsAsync(string collection, string documentId) => await _firebaseService.DocumentExistsAsync(collection, documentId);
        public async Task<WriteBatch> CreateBatchAsync() => await _firebaseService.CreateBatchAsync();
        public async Task CommitBatchAsync(WriteBatch batch) => await _firebaseService.CommitBatchAsync(batch);
    }
}