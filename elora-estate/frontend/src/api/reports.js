import api from './client';

export const getBrokerPerformanceReport = () => api.get('/reports/broker-performance');
export const getBusinessSummaryReport = () => api.get('/reports/business-summary');
