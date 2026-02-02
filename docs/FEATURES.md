# Features Guide

Comprehensive guide to all features in Debtinator Web.

## Table of Contents

- [Debt Management](#debt-management)
- [Payoff Planning](#payoff-planning)
- [Data Visualization](#data-visualization)
- [Settings & Customization](#settings--customization)

---

## Debt Management

The **Debts** tab is your central hub for tracking all outstanding debts.

### Adding a New Debt

1. Navigate to the **Debts** tab (first tab in the bottom navigation)
2. Click the **floating action button** (+) in the bottom right
3. Fill in the debt details:

| Field | Description | Example |
|-------|-------------|---------|
| **Debt Name** | A recognizable name for this debt | "Chase Sapphire Card" |
| **Debt Type** | Category for organization | Credit Card, Personal Loan, Other |
| **Interest Rate** | Annual Percentage Rate (APR) | 19.99% |
| **Current Balance** | Amount currently owed | $5,432.10 |
| **Minimum Payment** | Required monthly minimum | $150.00 |

4. Click **Add Debt** to save

### Debt Types

Debts are organized into three categories:

| Type | Description | Common Examples |
|------|-------------|-----------------|
| **Credit Card** | Revolving credit accounts | Visa, Mastercard, Store cards |
| **Personal Loan** | Fixed-term installment loans | Bank loans, Peer-to-peer loans |
| **Other** | Any other debt type | Medical bills, Family loans |

### Viewing Debt Summary

When you have debts added, the summary card at the top shows:

- **Total Debt**: Combined balance of all debts
- **Total Minimum Payment**: Sum of all monthly minimums
- **Average APR**: Weighted average interest rate (by balance)
- **Debt Count**: Number of active debts

### Editing a Debt

1. Click on any debt card to open the edit form
2. Modify the fields as needed
3. Click **Update Debt** to save changes

### Deleting a Debt

**Option 1: From Edit Form**
1. Click the debt card to open edit mode
2. Click **Delete Debt** at the bottom of the form
3. Confirm deletion in the dialog

**Option 2: Right-click (Context Menu)**
1. Right-click on a debt card
2. Confirm deletion in the dialog

> **Warning**: Deletion is permanent and cannot be undone. Data is stored only in your browser.

---

## Payoff Planning

Create a strategic plan to become debt-free from the **Payoff** tab.

### Understanding Payoff Methods

#### Snowball Method

**Best for**: People who need motivation and quick wins

**How it works**:
1. Pay minimum payments on all debts
2. Put extra money toward the **smallest balance**
3. When that's paid off, roll that payment to the next smallest
4. Repeat until debt-free

**Pros**: Quick psychological wins; builds momentum.  
**Cons**: May pay more total interest than Avalanche.

#### Avalanche Method

**Best for**: People who want to minimize total interest paid

**How it works**:
1. Pay minimum payments on all debts
2. Put extra money toward the **highest interest rate**
3. When that's paid off, roll that payment to the next highest rate
4. Repeat until debt-free

**Pros**: Mathematically optimal; saves money long-term.  
**Cons**: May take longer to see debts fully eliminated.

#### Custom Method (Coming Soon)

Define your own priority order based on personal preferences.

### Setting Up Your Payoff Plan

1. Navigate to the **Payoff** tab
2. Select your preferred method (Snowball or Avalanche) using the toggle buttons
3. Enter your **Total Monthly Payment**
   - Must be at least the sum of all minimum payments
   - Higher amounts accelerate payoff

### Reading the Payoff Summary

Once you enter a valid monthly payment, you'll see:

| Metric | Description |
|--------|-------------|
| **Time to Payoff** | Total months and years until debt-free |
| **Total Interest** | Total interest you'll pay over the payoff period |
| **Total Payments** | Combined principal + interest payments |

Buttons to **Timeline** and **Charts** appear when you have a valid plan.

### Income Insights

If you set **Monthly Income** in Settings, the Payoff tab shows:

- **Minimum payments as % of income** – How much of your income goes to minimum payments
- **Your payment as % of income** – When you enter a monthly payment, see what percentage of income it represents
- A reminder that experts suggest keeping debt payments under 36% of gross income

---

## Data Visualization

### Accessing Charts

1. Open the **menu** (☰) in the top bar
2. Click **Charts**

You need a valid payoff plan (monthly payment ≥ total minimums) to see charts.

### Principal vs. Interest Pie Chart

Shows the breakdown of your total payments:

- **Principal**: Amount going toward actual debt reduction
- **Interest**: Amount going to interest charges

Toggle between **Principal vs Interest** and **Balance Over Time** at the top of the Charts page.

### Balance Over Time Line Chart

Shows your combined debt balance decreasing over the payoff period:

- **X-Axis**: Months
- **Y-Axis**: Total remaining balance
- **Line**: Your debt-free journey

Y-axis labels use abbreviated format ($44.2k, $1.1M) to save space.

### Payoff Timeline

1. Open the **menu** (☰) and click **Timeline**
2. Or from the Payoff tab, click **Timeline** when you have a valid plan

For each month you'll see:

- Which debts receive payments
- Payment amount per debt
- Remaining balance after payment

Click **Load more months** to reveal additional months. Data is generated in the browser; nothing is sent to a server.

---

## Settings & Customization

### Accessing Settings

Click the **menu icon** (☰) in the top bar, then select **Settings**.

### Appearance

#### Theme Mode

| Option | Description |
|--------|-------------|
| **Light** | Bright theme with soft blue accents |
| **Dark** | Dark theme with purple accents |
| **System** | Automatically matches your device/browser setting |

Theme preference is saved in your browser (localStorage).

### Income (Optional)

1. In Settings, expand the **Income** section
2. Enter your **Monthly Income** (e.g., take-home pay)
3. Click outside the field or tab away to save

When income is set, the Payoff tab shows debt-to-income insights. Income is stored only in your browser.

### Export Data

Export all your debt information to Excel for sharing with a debt counselor or for your own records:

1. Open **Settings** and expand **Export Data**
2. Click **Export to Excel**
3. The file downloads to your computer (browser download; no data is sent to any server)

The Excel file includes:

- **Summary** – Total debt, minimum payments, income, payoff timeline, debt-to-income ratios
- **Debts** – Each debt with name, type, balance, interest rate, minimum payment
- **Income & Plan** – Monthly income and payoff method
- **Payoff Schedule** – Month-by-month breakdown (when you have a valid plan)

> **Note**: Export includes all data you've entered. Only share with trusted professionals.

### Data Persistence

All data is stored **only in your browser** using localStorage:

- Debts are saved automatically and persist across sessions
- Theme preference is remembered
- Income (if set) is saved
- Payoff method and monthly payment are in-memory (reset when you close the tab)

> **Important**: Clearing your browser data (cookies/storage) will remove your debts and settings. There is no cloud backup. Export to Excel if you want a backup.

---

## Help

From the menu, click **Features Guide** to open the in-app documentation page with a short overview of features.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between form fields |
| `Enter` | Submit forms |
| `Escape` | Close dialogs |

---

## Accessibility

Debtinator Web uses Material UI components that support:

- **Keyboard navigation** for all interactive elements
- **ARIA labels** where appropriate
- **Theme contrast** – Light and dark themes with sufficient color contrast
- **Focus indicators** for focusable elements
