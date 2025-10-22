import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
    Shield,
    AlertTriangle,
    Activity,
    Eye,
    Ban,
    FileText,
    TrendingUp,
    Users,
    Lock,
    Zap
} from 'lucide-react';
import { securityService } from '../../services/securityService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './SecurityDashboard.css';

interface SecurityDashboardData {
    generatedAt: string;
    eventsLast24Hours: number;
    highSeverityEventsLast24Hours: number;
    activeIncidents: number;
    criticalIncidents: number;
    threatScore: number;
    topThreats: Array<{ key: string; value: number }>;
    complianceScore: number;
    complianceIssues: number;
    systemHealth: string;
}

interface SecurityEvent {
    id: string;
    eventType: string;
    severity: string;
    description: string;
    source: string;
    timestamp: string;
    ipAddress: string;
}

interface ThreatDetection {
    id: string;
    threatType: string;
    severity: string;
    sourceIp: string;
    detectedAt: string;
    description: string;
    confidence: number;
    mitigated: boolean;
}

interface SecurityIncident {
    id: string;
    title: string;
    severity: string;
    status: string;
    created_at: string;
    assignedTo: string;
}

export const SecurityDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
    const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
    const [recentThreats, setRecentThreats] = useState<ThreatDetection[]>([]);
    const [activeIncidents, setActiveIncidents] = useState<SecurityIncident[]>([]);
    const [blockedIps, setBlockedIps] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadSecurityData();

        // Set up auto-refresh every 30 seconds
        const interval = setInterval(loadSecurityData, 30000);
        setRefreshInterval(interval);

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, []);

    const loadSecurityData = async () => {
        try {
            setError(null);

            const [dashboard, events, threats, incidents, ips] = await Promise.all([
                securityService.getSecurityDashboard(),
                securityService.getSecurityEvents(),
                securityService.getRecentThreats(),
                securityService.getActiveIncidents(),
                securityService.getBlockedIpAddresses()
            ]);

            setDashboardData(dashboard);
            setRecentEvents(events.slice(0, 10)); // Show only recent 10
            setRecentThreats(threats.slice(0, 10));
            setActiveIncidents(incidents);
            setBlockedIps(ips);
        } catch (err) {
            setError('Failed to load security data. Please try again.');
            console.error('Error loading security data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockIp = async (ipAddress: string, reason: string) => {
        try {
            await securityService.blockIpAddress(ipAddress, reason);
            await loadSecurityData(); // Refresh data
            alert(`IP address ${ipAddress} has been blocked successfully.`);
        } catch (err) {
            console.error('Error blocking IP:', err);
            alert('Failed to block IP address. Please try again.');
        }
    };

    const handleUnblockIp = async (ipAddress: string) => {
        try {
            await securityService.unblockIpAddress(ipAddress);
            await loadSecurityData(); // Refresh data
            alert(`IP address ${ipAddress} has been unblocked successfully.`);
        } catch (err) {
            console.error('Error unblocking IP:', err);
            alert('Failed to unblock IP address. Please try again.');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'severity-critical';
            case 'high': return 'severity-high';
            case 'medium': return 'severity-medium';
            case 'low': return 'severity-low';
            default: return 'severity-info';
        }
    };

    const getThreatScoreColor = (score: number) => {
        if (score >= 80) return 'threat-critical';
        if (score >= 60) return 'threat-high';
        if (score >= 40) return 'threat-medium';
        return 'threat-low';
    };

    if (loading) {
        return (
            <div className="security-dashboard">
                <LoadingSpinner />
                <p>Loading security dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="security-dashboard">
                <ErrorMessage message={error} onRetry={loadSecurityData} />
            </div>
        );
    }

    return (
        <div className="security-dashboard">
            <div className="security-header">
                <Shield className="security-icon" />
                <div>
                    <h1>Security Monitoring Dashboard</h1>
                    <p>Real-time security monitoring and threat detection</p>
                </div>
                <div className="header-actions">
                    <Button onClick={loadSecurityData} variant="outline">
                        <Activity className="button-icon" />
                        Refresh
                    </Button>
                </div>
            </div>

            {dashboardData && (
                <>
                    {/* Critical Alerts */}
                    {dashboardData.criticalIncidents > 0 && (
                        <Alert className="critical-alert">
                            <AlertTriangle className="alert-icon" />
                            <AlertDescription>
                                <strong>Critical Security Alert:</strong> {dashboardData.criticalIncidents} critical incident(s) require immediate attention.
                            </AlertDescription>
                        </Alert>
                    )}

                    {dashboardData.threatScore >= 80 && (
                        <Alert className="high-threat-alert">
                            <Zap className="alert-icon" />
                            <AlertDescription>
                                <strong>High Threat Level:</strong> Current threat score is {dashboardData.threatScore.toFixed(1)}. Enhanced monitoring recommended.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Overview Cards */}
                    <div className="security-overview-grid">
                        <Card className="security-metric-card">
                            <CardHeader>
                                <CardTitle>
                                    <Activity className="card-icon" />
                                    Security Events (24h)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="metric-value">{dashboardData.eventsLast24Hours}</div>
                                <div className="metric-detail">
                                    {dashboardData.highSeverityEventsLast24Hours} high severity
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="security-metric-card">
                            <CardHeader>
                                <CardTitle>
                                    <AlertTriangle className="card-icon" />
                                    Active Incidents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="metric-value">{dashboardData.activeIncidents}</div>
                                <div className="metric-detail">
                                    {dashboardData.criticalIncidents} critical
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="security-metric-card">
                            <CardHeader>
                                <CardTitle>
                                    <Shield className="card-icon" />
                                    Threat Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`metric-value ${getThreatScoreColor(dashboardData.threatScore)}`}>
                                    {dashboardData.threatScore.toFixed(1)}
                                </div>
                                <div className="metric-detail">
                                    Out of 100
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="security-metric-card">
                            <CardHeader>
                                <CardTitle>
                                    <FileText className="card-icon" />
                                    Compliance Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="metric-value">{dashboardData.complianceScore.toFixed(1)}%</div>
                                <div className="metric-detail">
                                    {dashboardData.complianceIssues} issues
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            <Tabs defaultValue={activeTab} className="security-tabs">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="events">Security Events</TabsTrigger>
                    <TabsTrigger value="threats">Threat Detection</TabsTrigger>
                    <TabsTrigger value="incidents">Incidents</TabsTrigger>
                    <TabsTrigger value="blocked-ips">Blocked IPs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="overview-tab">
                    <div className="overview-content">
                        <div className="overview-section">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Threats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData?.topThreats.length ? (
                                        <div className="threat-list">
                                            {dashboardData.topThreats.map((threat, index) => (
                                                <div key={index} className="threat-item">
                                                    <span className="threat-source">{threat.key}</span>
                                                    <span className="threat-count">{threat.value} events</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-data">No threats detected in the last 24 hours</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="overview-section">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Health</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`system-health ${dashboardData?.systemHealth.toLowerCase()}`}>
                                        <div className="health-indicator"></div>
                                        <span>{dashboardData?.systemHealth}</span>
                                    </div>
                                    <p className="health-description">
                                        All security systems are operating normally
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="events" className="events-tab">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Security Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentEvents.length ? (
                                <div className="events-list">
                                    {recentEvents.map((event) => (
                                        <div key={event.id} className="event-item">
                                            <div className="event-header">
                                                <span className={`event-severity ${getSeverityColor(event.severity)}`}>
                                                    {event.severity}
                                                </span>
                                                <span className="event-type">{event.eventType}</span>
                                                <span className="event-time">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="event-description">{event.description}</div>
                                            <div className="event-details">
                                                <span>Source: {event.source}</span>
                                                <span>IP: {event.ipAddress}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No recent security events</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="threats" className="threats-tab">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Threat Detections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentThreats.length ? (
                                <div className="threats-list">
                                    {recentThreats.map((threat) => (
                                        <div key={threat.id} className="threat-item">
                                            <div className="threat-header">
                                                <span className={`threat-severity ${getSeverityColor(threat.severity)}`}>
                                                    {threat.severity}
                                                </span>
                                                <span className="threat-type">{threat.threatType}</span>
                                                <span className="threat-confidence">
                                                    {(threat.confidence * 100).toFixed(0)}% confidence
                                                </span>
                                                <span className="threat-time">
                                                    {new Date(threat.detectedAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="threat-description">{threat.description}</div>
                                            <div className="threat-details">
                                                <span>Source IP: {threat.sourceIp}</span>
                                                <span>Status: {threat.mitigated ? 'Mitigated' : 'Active'}</span>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleBlockIp(threat.sourceIp, `Threat detected: ${threat.threatType}`)}
                                                    disabled={threat.mitigated}
                                                >
                                                    <Ban className="button-icon" />
                                                    Block IP
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No recent threat detections</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="incidents" className="incidents-tab">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Security Incidents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeIncidents.length ? (
                                <div className="incidents-list">
                                    {activeIncidents.map((incident) => (
                                        <div key={incident.id} className="incident-item">
                                            <div className="incident-header">
                                                <span className={`incident-severity ${getSeverityColor(incident.severity)}`}>
                                                    {incident.severity}
                                                </span>
                                                <span className="incident-status">{incident.status}</span>
                                                <span className="incident-time">
                                                    {new Date(incident.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="incident-title">{incident.title}</div>
                                            <div className="incident-details">
                                                <span>Assigned to: {incident.assignedTo || 'Unassigned'}</span>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="button-icon" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No active security incidents</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blocked-ips" className="blocked-ips-tab">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blocked IP Addresses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {blockedIps.length ? (
                                <div className="blocked-ips-list">
                                    {blockedIps.map((ip) => (
                                        <div key={ip} className="blocked-ip-item">
                                            <span className="ip-address">{ip}</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUnblockIp(ip)}
                                            >
                                                <Lock className="button-icon" />
                                                Unblock
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No blocked IP addresses</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};


