using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;

namespace BingGoWebAPI.Services;

public interface IFirebaseConfigService
{
    FirebaseApp GetFirebaseApp();
    FirestoreDb GetFirestoreDb();
    string GetProjectId();
    string GetStorageBucket();
}

public class FirebaseConfigService : IFirebaseConfigService
{
    private readonly FirebaseApp _firebaseApp;
    private readonly FirestoreDb _firestoreDb;
    private readonly string _projectId;
    private readonly string _storageBucket;
    private readonly ILogger<FirebaseConfigService> _logger;

    public FirebaseConfigService(IConfiguration configuration, ILogger<FirebaseConfigService> logger)
    {
        _logger = logger;
        _projectId = configuration["Firebase:ProjectId"] ?? "kltn-c5cf0";
        _storageBucket = configuration["Firebase:StorageBucket"] ?? "kltn-c5cf0.appspot.com";

        try
        {
            // Initialize Firebase App if not already initialized
            if (FirebaseApp.DefaultInstance == null)
            {
                var serviceAccountKeyPath = configuration["Firebase:ServiceAccountKeyPath"];
                
                if (!string.IsNullOrEmpty(serviceAccountKeyPath) && File.Exists(serviceAccountKeyPath))
                {
                    _firebaseApp = FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromFile(serviceAccountKeyPath),
                        ProjectId = _projectId
                    });
                    
                    _logger.LogInformation("Firebase initialized with service account key: {KeyPath}", serviceAccountKeyPath);
                }
                else
                {
                    // Try to use default credentials (for production environments)
                    _firebaseApp = FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.GetApplicationDefault(),
                        ProjectId = _projectId
                    });
                    
                    _logger.LogInformation("Firebase initialized with default credentials");
                }
            }
            else
            {
                _firebaseApp = FirebaseApp.DefaultInstance;
                _logger.LogInformation("Using existing Firebase app instance");
            }

            // Initialize Firestore with credentials
            var credential = _firebaseApp.Options.Credential;
            var firestoreBuilder = new FirestoreDbBuilder
            {
                ProjectId = _projectId,
                Credential = credential
            };
            _firestoreDb = firestoreBuilder.Build();
            _logger.LogInformation("Firestore database initialized for project: {ProjectId}", _projectId);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Firebase services");
            throw new InvalidOperationException("Firebase initialization failed", ex);
        }
    }

    public FirebaseApp GetFirebaseApp() => _firebaseApp;
    public FirestoreDb GetFirestoreDb() => _firestoreDb;
    public string GetProjectId() => _projectId;
    public string GetStorageBucket() => _storageBucket;
}