export const customers = [
  { id:'C-1001', name:'Olivia Rhye', email:'olivia@example.com', plan:'Premium', tenure:42, monthly:89, contract:'Two year', payment:'Credit card', usage:'High', risk:'Low', churn:12, status:'Active' },
  { id:'C-1002', name:'Phoenix Baker', email:'phoenix@example.com', plan:'Basic', tenure:3, monthly:29, contract:'Month-to-month', payment:'Electronic check', usage:'Low', risk:'High', churn:87, status:'At risk' },
  { id:'C-1003', name:'Lana Steiner', email:'lana@example.com', plan:'Standard', tenure:18, monthly:59, contract:'One year', payment:'Bank transfer', usage:'Medium', risk:'Medium', churn:54, status:'Active' },
  { id:'C-1004', name:'Demi Wilkinson', email:'demi@example.com', plan:'Premium', tenure:55, monthly:99, contract:'Two year', payment:'Credit card', usage:'High', risk:'Low', churn:8, status:'Active' },
  { id:'C-1005', name:'Candice Wu', email:'candice@example.com', plan:'Basic', tenure:2, monthly:25, contract:'Month-to-month', payment:'Electronic check', usage:'Low', risk:'High', churn:93, status:'At risk' },
  { id:'C-1006', name:'Natali Craig', email:'natali@example.com', plan:'Standard', tenure:26, monthly:65, contract:'One year', payment:'Credit card', usage:'Medium', risk:'Medium', churn:46, status:'Active' },
  { id:'C-1007', name:'Drew Cano', email:'drew@example.com', plan:'Premium', tenure:61, monthly:105, contract:'Two year', payment:'Bank transfer', usage:'High', risk:'Low', churn:5, status:'Active' },
  { id:'C-1008', name:'Orlando Diggs', email:'orlando@example.com', plan:'Basic', tenure:5, monthly:35, contract:'Month-to-month', payment:'Electronic check', usage:'Low', risk:'High', churn:79, status:'At risk' },
]

export const churnTrend = [
  { month:'Jan', rate:24.8, saved:42 }, { month:'Feb', rate:23.9, saved:48 },
  { month:'Mar', rate:22.5, saved:55 }, { month:'Apr', rate:21.8, saved:61 },
  { month:'May', rate:20.4, saved:69 }, { month:'Jun', rate:19.2, saved:78 },
  { month:'Jul', rate:18.6, saved:86 }, { month:'Aug', rate:17.4, saved:94 },
]

export const segmentData = [
  { name:'Low risk', value:58, color:'#31c99a' },
  { name:'Medium risk', value:25, color:'#f4b860' },
  { name:'High risk', value:17, color:'#f16d83' },
]

export const recommendations = [
  { title:'Reach out to new monthly subscribers', detail:'Customers with under 6 months tenure and month-to-month contracts show elevated churn risk.', tag:'High impact', count:'126 customers', action:'Create outreach list' },
  { title:'Offer annual-plan incentives', detail:'Offer a tailored annual-plan discount to customers with consistent usage and monthly billing.', tag:'Revenue growth', count:'84 customers', action:'Review segment' },
  { title:'Re-engage low-usage customers', detail:'A product walkthrough and proactive support can help customers who have reduced activity.', tag:'Retention', count:'53 customers', action:'View customers' },
]
