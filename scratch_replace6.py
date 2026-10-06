import sys

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# First, define state variable `isRestored` at the top of the EnterpriseProvider
if 'const [isRestored, setIsRestored]' not in text:
    provider_def = "export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {"
    new_provider_def = provider_def + "\n    const [isRestored, setIsRestored] = useState(false);\n"
    text = text.replace(provider_def, new_provider_def)

# Add the useEffect logic right before return (
logic = """
    useEffect(() => {
        const saved = localStorage.getItem('AVALON_LIVE_STATE');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Call restore immediately on mount
                if (parsed) {
                    if (parsed.inventory) setInventory(parsed.inventory);
                    if (parsed.systemUsers) setSystemUsers(parsed.systemUsers);
                    if (parsed.suppliers) setSuppliers(parsed.suppliers);
                    if (parsed.importDossiers) setImportDossiers(parsed.importDossiers);
                    if (parsed.dispatches) setDispatches(parsed.dispatches);
                    if (parsed.commissionRules) setCommissionRules(parsed.commissionRules);
                    if (parsed.crmSettings) setCrmSettings(parsed.crmSettings);
                    if (parsed.locations) setLocations(parsed.locations);
                    if (parsed.worldOfficeConfig) setWorldOfficeConfig(parsed.worldOfficeConfig);
                    if (parsed.kardexTransactions) setKardexTransactions(parsed.kardexTransactions);
                    if (parsed.notificationRules) setNotificationRules(parsed.notificationRules);
                    if (parsed.deals) setDeals(parsed.deals);
                    if (parsed.contacts) setContacts(parsed.contacts);
                    if (parsed.activities) setActivities(parsed.activities);
                    if (parsed.events) setEvents(parsed.events);
                    if (parsed.receipts) setReceipts(parsed.receipts);
                    if (parsed.assignmentLogs) setAssignmentLogs(parsed.assignmentLogs);
                    if (parsed.paymentMethods) setPaymentMethods(parsed.paymentMethods);
                    if (parsed.pointsOfSale) setPointsOfSale(parsed.pointsOfSale);
                    if (parsed.tintometricRules) setTintometricRules(parsed.tintometricRules);
                    if (parsed.reverseDisplayRules) setReverseDisplayRules(parsed.reverseDisplayRules);
                    if (parsed.litersToCunetesRules) setLitersToCunetesRules(parsed.litersToCunetesRules);
                    if (parsed.fractionalRules) setFractionalRules(parsed.fractionalRules);
                    if (parsed.rawMaterialCategories) setRawMaterialCategories(parsed.rawMaterialCategories);
                    if (parsed.accountingShortcuts) setAccountingShortcuts(parsed.accountingShortcuts);
                    if (parsed.taxRates) setTaxRates(parsed.taxRates);
                    if (parsed.recipes) setRecipes(parsed.recipes);
                }
            } catch(e) {
                console.error('Error restoring state from localStorage', e);
            }
        }
        setIsRestored(true);
    }, []);

    const stateObj = getCompleteState();
    useEffect(() => {
        if (!isRestored) return;
        const timer = setTimeout(() => {
            try {
                localStorage.setItem('AVALON_LIVE_STATE', JSON.stringify(stateObj));
            } catch (e) {
                console.error('Failed to save state to localStorage', e);
            }
        }, 1000); // 1s debounce to avoid blocking UI
        return () => clearTimeout(timer);
    }, [stateObj, isRestored]);

    return (
        <EnterpriseContext.Provider
"""

text = text.replace("    return (\n        <EnterpriseContext.Provider", logic)

with open(r'c:\James\Scarpian AI\TECH\Clients\Procoquinal\Avalon_V1\Avalon_V1_CODE\context\EnterpriseContext.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated EnterpriseContext to use localStorage cache')
