import { apiService } from './api';

export interface SecurityDashboardData {
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

export interface SecurityEvent {
    id: string;
    eventType: string;
    severity: string;
    description: string;
    source: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    metadata: Record<string, any>;
}

export interface ThreatDetection {
    id: string;
    threatType: string;
    severity: string;
    sourceIp: string;
    targetUserId: string;
    detectedAt: string;
    eventId: string;
    description: string;
    confidence: number;
    mitigated: boolean;
    mitigationAction: string;
}

export interface SecurityIncident {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    priority: string;
    createdAt: string;
    resolvedAt?: string;
    updatedAt?: string;
    createdBy: string;
    assignedTo: string;
    tags: string[];
    relatedEvents: string[];
    statusNotes: string;
}

export interface SecurityAlert {
    id: string;
    alertType: string;
    severity: string;
    message: string;
    source: string;
    relatedEventId: string;
    createdAt: string;
    status: string;
    metadata: Record<string, any>;
}

export interface SecurityMetric {
    date: string;
    metricType: string;
    value: number;
    description: string;
}

export interface SecurityComplianceReport {
    generatedAt: string;
    fromDate: string;
    toDate: string;
    overallScore: number;
    authenticationScore: number;
    dataProtectionScore: number;
    accessControlScore: number;
    auditLoggingScore: number;
    issues: string[];
    recommendations: string[];
}

export interface IntrusionDetectionReport {
    generatedAt: string;
    fromDate: string;
    toDate: string;
    totalThreats: number;
    threatsByType: Record<string, number>;
    blockedIpCount: number;
    topBlockedIps: string[];
    detectionAccuracy: number;
    topAttackSources: Record<string, number>;
}

export interface DetectionRule {
    id: string;
    name: string;
    description: string;
    ruleType: string;
    pattern: string;
    severity: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    details: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
}

class SecurityService {
    private baseUrl = '/security';

    /**
     * Get security dashboard data
     */
    async getSecurityDashboard(): Promise<SecurityDashboardData> {
        try {
            const response = await apiService.get(`${this.baseUrl}/dashboard`);
            return response.data as SecurityDashboardData;
        } catch (error) {
            console.error('Error getting security dashboard:', error);
            throw new Error('Failed to get security dashboard data');
        }
    }

    /**
     * Get security events
     */
    async getSecurityEvents(
        fromDate?: Date,
        toDate?: Date,
        eventType?: string
    ): Promise<SecurityEvent[]> {
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());
            if (eventType) params.append('eventType', eventType);

            const response = await apiService.get(`${this.baseUrl}/events?${params.toString()}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting security events:', error);
            throw new Error('Failed to get security events');
        }
    }

    /**
     * Log security event
     */
    async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
        try {
            await apiService.post(`${this.baseUrl}/events`, event);
        } catch (error) {
            console.error('Error logging security event:', error);
            throw new Error('Failed to log security event');
        }
    }

    /**
     * Get threat analysis
     */
    async getThreatAnalysis(hours: number = 24): Promise<any> {
        try {
            const response = await apiService.get(`${this.baseUrl}/threats/analysis?hours=${hours}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting threat analysis:', error);
            throw new Error('Failed to get threat analysis');
        }
    }

    /**
     * Get recent threats
     */
    async getRecentThreats(hours: number = 24): Promise<ThreatDetection[]> {
        try {
            const response = await apiService.get(`${this.baseUrl}/threats?hours=${hours}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting recent threats:', error);
            throw new Error('Failed to get recent threats');
        }
    }

    /**
     * Get active incidents
     */
    async getActiveIncidents(): Promise<SecurityIncident[]> {
        try {
            const response = await apiService.get(`${this.baseUrl}/incidents`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting active incidents:', error);
            throw new Error('Failed to get active incidents');
        }
    }

    /**
     * Create security incident
     */
    async createIncident(incident: Partial<SecurityIncident>): Promise<SecurityIncident> {
        try {
            const response = await apiService.post(`${this.baseUrl}/incidents`, incident);
            return response.data as any;
        } catch (error) {
            console.error('Error creating security incident:', error);
            throw new Error('Failed to create security incident');
        }
    }

    /**
     * Update incident status
     */
    async updateIncidentStatus(
        incidentId: string,
        status: string,
        notes: string
    ): Promise<void> {
        try {
            await apiService.put(`${this.baseUrl}/incidents/${incidentId}/status`, {
                status,
                notes
            });
        } catch (error) {
            console.error('Error updating incident status:', error);
            throw new Error('Failed to update incident status');
        }
    }

    /**
     * Get blocked IP addresses
     */
    async getBlockedIpAddresses(): Promise<string[]> {
        try {
            const response = await apiService.get(`${this.baseUrl}/blocked-ips`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting blocked IP addresses:', error);
            throw new Error('Failed to get blocked IP addresses');
        }
    }

    /**
     * Block IP address
     */
    async blockIpAddress(
        ipAddress: string,
        reason: string,
        durationHours?: number
    ): Promise<void> {
        try {
            await apiService.post(`${this.baseUrl}/blocked-ips`, {
                ipAddress,
                reason,
                durationHours
            });
        } catch (error) {
            console.error('Error blocking IP address:', error);
            throw new Error('Failed to block IP address');
        }
    }

    /**
     * Unblock IP address
     */
    async unblockIpAddress(ipAddress: string): Promise<void> {
        try {
            await apiService.delete(`${this.baseUrl}/blocked-ips/${encodeURIComponent(ipAddress)}`);
        } catch (error) {
            console.error('Error unblocking IP address:', error);
            throw new Error('Failed to unblock IP address');
        }
    }

    /**
     * Get detection rules
     */
    async getDetectionRules(): Promise<DetectionRule[]> {
        try {
            const response = await apiService.get(`${this.baseUrl}/detection-rules`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting detection rules:', error);
            throw new Error('Failed to get detection rules');
        }
    }

    /**
     * Update detection rules
     */
    async updateDetectionRules(rules: DetectionRule[]): Promise<void> {
        try {
            await apiService.put(`${this.baseUrl}/detection-rules`, rules);
        } catch (error) {
            console.error('Error updating detection rules:', error);
            throw new Error('Failed to update detection rules');
        }
    }

    /**
     * Get security metrics
     */
    async getSecurityMetrics(
        fromDate?: Date,
        toDate?: Date
    ): Promise<SecurityMetric[]> {
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());

            const response = await apiService.get(`${this.baseUrl}/metrics?${params.toString()}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting security metrics:', error);
            throw new Error('Failed to get security metrics');
        }
    }

    /**
     * Get compliance report
     */
    async getComplianceReport(
        fromDate?: Date,
        toDate?: Date
    ): Promise<SecurityComplianceReport> {
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());

            const response = await apiService.get(`${this.baseUrl}/compliance-report?${params.toString()}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting compliance report:', error);
            throw new Error('Failed to get compliance report');
        }
    }

    /**
     * Get intrusion detection report
     */
    async getIntrusionDetectionReport(
        fromDate?: Date,
        toDate?: Date
    ): Promise<IntrusionDetectionReport> {
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());

            const response = await apiService.get(`${this.baseUrl}/intrusion-report?${params.toString()}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting intrusion detection report:', error);
            throw new Error('Failed to get intrusion detection report');
        }
    }

    /**
     * Trigger security alert
     */
    async triggerSecurityAlert(alert: Partial<SecurityAlert>): Promise<void> {
        try {
            await apiService.post(`${this.baseUrl}/alerts`, alert);
        } catch (error) {
            console.error('Error triggering security alert:', error);
            throw new Error('Failed to trigger security alert');
        }
    }

    /**
     * Get audit logs
     */
    async getAuditLogs(
        fromDate?: Date,
        toDate?: Date,
        userId?: string,
        action?: string
    ): Promise<AuditLog[]> {
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString());
            if (toDate) params.append('toDate', toDate.toISOString());
            if (userId) params.append('userId', userId);
            if (action) params.append('action', action);

            const response = await apiService.get(`${this.baseUrl}/audit-logs?${params.toString()}`);
            return response.data as any;
        } catch (error) {
            console.error('Error getting audit logs:', error);
            throw new Error('Failed to get audit logs');
        }
    }

    /**
     * Export security data
     */
    async exportSecurityData(
        fromDate: Date,
        toDate: Date,
        dataTypes: string[],
        format: string = 'json'
    ): Promise<{ exportId: string; message: string }> {
        try {
            const response = await apiService.post(`${this.baseUrl}/export`, {
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString(),
                dataTypes,
                format
            });
            return response.data as any;
        } catch (error) {
            console.error('Error exporting security data:', error);
            throw new Error('Failed to export security data');
        }
    }

    /**
     * Real-time security monitoring
     */
    setupRealTimeMonitoring(callback: (event: SecurityEvent) => void): () => void {
        // This would typically use WebSockets or Server-Sent Events
        // For now, we'll use polling as a fallback
        const interval = setInterval(async () => {
            try {
                const recentEvents = await this.getSecurityEvents(
                    new Date(Date.now() - 60000), // Last minute
                    new Date()
                );

                recentEvents.forEach(callback);
            } catch (error) {
                console.error('Error in real-time monitoring:', error);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }

    /**
     * Check if user has security admin permissions
     */
    async hasSecurityAdminPermissions(): Promise<boolean> {
        try {
            // This would check user permissions
            // For now, return true if user can access security endpoints
            await this.getSecurityDashboard();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get security event types for filtering
     */
    getSecurityEventTypes(): string[] {
        return [
            'AuthenticationSuccess',
            'AuthenticationFailure',
            'AuthorizationFailure',
            'SuspiciousActivity',
            'DataAccess',
            'DataModification',
            'SystemAccess',
            'ConfigurationChange',
            'SecurityViolation',
            'IntrusionAttempt',
            'MalwareDetection',
            'UnauthorizedAccess'
        ];
    }

    /**
     * Get security severity levels
     */
    getSecuritySeverityLevels(): string[] {
        return ['Info', 'Low', 'Medium', 'High', 'Critical'];
    }

    /**
     * Format security event for display
     */
    formatSecurityEvent(event: SecurityEvent): string {
        const timestamp = new Date(event.timestamp).toLocaleString();
        return `[${timestamp}] ${event.severity.toUpperCase()}: ${event.description} (Source: ${event.source})`;
    }

    /**
     * Calculate threat level based on score
     */
    getThreatLevel(score: number): string {
        if (score >= 80) return 'Critical';
        if (score >= 60) return 'High';
        if (score >= 40) return 'Medium';
        if (score >= 20) return 'Low';
        return 'Minimal';
    }

    /**
     * Get threat level color
     */
    getThreatLevelColor(score: number): string {
        if (score >= 80) return '#dc2626'; // Red
        if (score >= 60) return '#ea580c'; // Orange
        if (score >= 40) return '#d97706'; // Amber
        if (score >= 20) return '#059669'; // Green
        return '#6b7280'; // Gray
    }
}

export const securityService = new SecurityService();
