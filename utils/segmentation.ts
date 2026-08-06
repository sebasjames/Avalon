import { CrmContact, CustomerTier, BusinessType } from '../types';

export function recalculateClientTiers(contacts: CrmContact[]): CrmContact[] {
  // 1. Calculate total revenue across all clients
  const totalRevenue = contacts.reduce((sum, c) => sum + (c.purchaseHistory?.annual || 0), 0);
  
  // 2. Sort clients by annual revenue descending to apply Pareto
  const sortedClients = [...contacts].sort((a, b) => 
      (b.purchaseHistory?.annual || 0) - (a.purchaseHistory?.annual || 0)
  );
  
  let cumulativeRevenue = 0;
  
  return sortedClients.map((client, index) => {
      const annual = client.purchaseHistory?.annual || 0;
      cumulativeRevenue += annual;
      
      // Pareto: Top 20 clients OR clients that make up to 70% of revenue
      const isTop20 = index < 20;
      const isTop70Percent = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) <= 0.7 : false;
      
      let calculatedTier = CustomerTier.REGULAR;
      
      if ((isTop20 || isTop70Percent) && annual > 0) {
          calculatedTier = CustomerTier.VIP;
      } else if (
          client.highGrowthPotential || 
          client.exclusiveProjects || 
          client.highPrestige || 
          client.displacedCompetitor
      ) {
          calculatedTier = CustomerTier.STRATEGIC;
      } else if (annual > 0 && annual < 10000 && client.businessType !== BusinessType.DIY) { 
          // Clients with low billing that might need decreased efforts, unless they are DIY (who are naturally low but sporadic)
          calculatedTier = CustomerTier.DECREASE;
      } else if (annual > 50000) { 
          // Arbitrary threshold for potential clients that are not yet VIP
          calculatedTier = CustomerTier.POTENTIAL;
      } else if (annual > 10000 && annual <= 50000 && client.status === 'VINCULADO') {
          // Clients that might require attention
          calculatedTier = CustomerTier.ATTENTION;
      }
      
      // Keep 'NEW' if no purchases and not strategic
      if (annual === 0 && calculatedTier !== CustomerTier.STRATEGIC) {
          calculatedTier = CustomerTier.NEW;
      }
      
      // Apply default business type if missing
      const businessType = client.businessType || BusinessType.MICROEMPRESARIO;
      
      let finalDispatchBlocked = client.dispatchBlocked;
      let finalVipApprovalPending = client.vipApprovalPending || false;

      if (finalDispatchBlocked && calculatedTier === CustomerTier.VIP) {
          finalDispatchBlocked = false;
          finalVipApprovalPending = true;
      }
      
      return {
          ...client,
          tier: calculatedTier,
          businessType,
          dispatchBlocked: finalDispatchBlocked,
          vipApprovalPending: finalVipApprovalPending
      };
  });
}
