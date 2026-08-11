window.OPPORTUNITY_DATA = [
  {
    id:"uk-health-ai-001", type:"tender", title:"UK Healthcare AI Workflow Pilot", country:"UK", industries:["healthcare","ai","consulting"],
    value:80000, deadline:"2026-08-20", foreign:"local_or_partner", action:"APPLY", source:"UK public procurement (demo)", sourceUrl:"https://www.gov.uk/contracts-finder",
    evidenceGrade:"C", confidence:58, evidenceType:"demo", checkedAt:"2026-08-11T08:00:00+01:00",
    fact:"This is a simulated procurement opportunity used to test OpportunityOS workflow and eligibility logic; it is not a live tender.",
    interpretation:"A UK healthcare SME with AI workflow capability would be a plausible target profile for this kind of opportunity.",
    opportunity:"Use this pattern to validate whether Company DNA, eligibility checks and bid-preparation actions are useful before live tender data is connected.",
    eligibility:["UK supplier or eligible delivery partner","Healthcare workflow capability","SME-suitable lot"], unknown:["Previous public-sector reference","Specific information-security requirement"], documents:["Company profile","Capability statement","Pricing","Data-security response"],
    summary:"Demo opportunity representing an NHS/healthcare AI workflow pilot.", demo:true
  },
  {
    id:"uk-cyber-002", type:"tender", title:"SME AI Security Readiness Support", country:"UK", industries:["ai","consulting","cyber"],
    value:45000, deadline:"2026-08-16", foreign:"uk_only", action:"APPLY", source:"UK public procurement (demo)", sourceUrl:"https://www.find-tender.service.gov.uk/",
    evidenceGrade:"C", confidence:55, evidenceType:"demo", checkedAt:"2026-08-11T08:00:00+01:00",
    fact:"This is a simulated public-sector opportunity, not a confirmed live notice.",
    interpretation:"AI governance and security-readiness services are a plausible adjacent service category for UK SMEs, but purchase intent must be validated with real buyers.",
    opportunity:"Test a manual £49 AI Security Check as a lead-in offer before investing in automated security tooling.",
    eligibility:["UK SME","Cyber/AI governance capability"], unknown:["Minimum insurance level"], documents:["Insurance","Method statement","Pricing"], summary:"Demo procurement pattern for SME AI security-readiness support.", demo:true
  },
  {
    id:"kr-med-partner-003", type:"partner", title:"Korean Diagnostics Distribution Partner Search", country:"KR", industries:["healthcare","diagnostics","import export"],
    value:35000, deadline:null, foreign:"open", action:"CONTACT", source:"Commercial opportunity (demo)", sourceUrl:"https://www.kotra.or.kr/",
    evidenceGrade:"C", confidence:52, evidenceType:"demo", checkedAt:"2026-08-11T08:00:00+01:00",
    fact:"This is a simulated cross-border partner-search opportunity.",
    interpretation:"A UK diagnostics supplier may need a Korean distributor or regulatory partner to enter the market.",
    opportunity:"Validate distributor demand manually before building automated partner matching.",
    eligibility:["Diagnostics or healthcare offering","Cross-border capability"], unknown:["MFDS product status","Distributor exclusivity"], documents:["Product catalogue","Regulatory status","Wholesale pricing"], summary:"Demo commercial opportunity for finding a Korean diagnostics distribution partner.", demo:true
  },
  {
    id:"eu-battery-004", type:"regulation", title:"EU Battery Passport Readiness Service", country:"EU", industries:["consulting","import export"],
    value:18000, deadline:"2027-02-18", foreign:"open", action:"PREPARE", source:"EU regulatory opportunity (demo)", sourceUrl:"https://commission.europa.eu/",
    evidenceGrade:"C", confidence:50, evidenceType:"demo", checkedAt:"2026-08-11T08:00:00+01:00",
    fact:"This entry is a simulated regulatory-service opportunity and must not be treated as a verified compliance deadline for a specific product.",
    interpretation:"Traceability and product-passport rules can create advisory demand, but exact scope must be checked against the applicable EU legislation and product category.",
    opportunity:"Offer a paid readiness checklist only after validating the customer's product scope and legal obligations.",
    eligibility:["EU market-facing supplier or adviser"], unknown:["Exact product scope"], documents:["Product BOM","Supply-chain data"], summary:"Demo opportunity for battery traceability and passport-readiness advisory work.", demo:true
  },
  {
    id:"risk-shipping-005", type:"risk", title:"Gulf Shipping Cost Exposure", country:"GLOBAL", industries:["import export","healthcare","diagnostics"],
    value:-2800, deadline:null, foreign:"open", action:"MONITOR", source:"Risk signal (demo)", sourceUrl:"https://www.imo.org/",
    evidenceGrade:"C", confidence:45, evidenceType:"demo", checkedAt:"2026-08-11T08:00:00+01:00",
    fact:"The £2,800 figure is a demo placeholder, not a measured cost impact for the user's business.",
    interpretation:"Shipping, insurance and FX shocks can materially change landed cost for importers.",
    opportunity:"Replace generic alerts with customer-specific landed-cost calculations using actual invoices, routes, terms and insurance costs.",
    eligibility:[], unknown:["Actual freight contracts","Incoterms","Insurance premium","Shipment frequency"], documents:["Recent freight invoice","Supplier invoice","Incoterms"], summary:"Demo risk signal showing how freight and insurance changes could affect annual cost.", demo:true
  },
  {
    id:"saving-ai-006", type:"saving", title:"Customer & Tender Draft Automation", country:"GLOBAL", industries:["consulting","ai","healthcare","import export"],
    value:3200, deadline:null, foreign:"open", action:"AUTOMATE", source:"Internal efficiency estimate (demo)", sourceUrl:"",
    evidenceGrade:"C", confidence:48, evidenceType:"demo", checkedAt:"2026-08-11T08:00:00+01:00",
    fact:"The £3,200 annual saving is a simulated estimate and is not based on measured staff time for the current user.",
    interpretation:"Repeated drafting tasks can often be reduced with controlled AI workflows, but realised savings depend on volume, review time and error rates.",
    opportunity:"Measure one week of drafting time before quoting ROI or selling an automation package.",
    eligibility:["Repeated email/report/tender drafting"], unknown:["Actual staff hours","Review time","Error/rework rate"], documents:["One week task log"], summary:"Demo efficiency opportunity for automating repeated drafting work.", demo:true
  }
];
