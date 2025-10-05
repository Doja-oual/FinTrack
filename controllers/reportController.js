const { Transaction, Category, Budget } = require('../models');
const { Op } = require('sequelize');
const puppeteer = require('puppeteer');

const reportController = {
  // Page principale des rapports
  index: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { month, year } = req.query;
      
      const now = new Date();
      const selectedMonth = month ? parseInt(month) - 1 : now.getMonth();
      const selectedYear = year ? parseInt(year) : now.getFullYear();
      
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      
      // Mois précédent
      const prevFirstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const prevLastDay = new Date(selectedYear, selectedMonth, 0);

    
      const currentTransactions = await Transaction.findAll({
        where: {
          userId,
          date: { [Op.between]: [firstDay, lastDay] }
        }
      });

      const prevTransactions = await Transaction.findAll({
        where: {
          userId,
          date: { [Op.between]: [prevFirstDay, prevLastDay] }
        }
      });

      const currentIncome = currentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const currentExpense = currentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const prevIncome = prevTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const prevExpense = prevTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const summary = {
        income: currentIncome,
        expense: currentExpense,
        balance: currentIncome - currentExpense,
        incomeChange: prevIncome ? ((currentIncome - prevIncome) / prevIncome * 100) : 0,
        expenseChange: prevExpense ? ((currentExpense - prevExpense) / prevExpense * 100) : 0
      };

      const transactionsWithCategories = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          date: { [Op.between]: [firstDay, lastDay] }
        },
        include: [{ model: Category, as: 'category' }]
      });

      const prevTransactionsWithCategories = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          date: { [Op.between]: [prevFirstDay, prevLastDay] }
        },
        include: [{ model: Category, as: 'category' }]
      });

      const categoryStats = {};
      const prevCategoryStats = {};

      transactionsWithCategories.forEach(t => {
        if (t.category) {
          const catName = t.category.name;
          categoryStats[catName] = (categoryStats[catName] || 0) + parseFloat(t.amount);
        }
      });

      prevTransactionsWithCategories.forEach(t => {
        if (t.category) {
          const catName = t.category.name;
          prevCategoryStats[catName] = (prevCategoryStats[catName] || 0) + parseFloat(t.amount);
        }
      });

      const categoryReport = Object.keys(categoryStats).map(catName => {
        const current = categoryStats[catName];
        const previous = prevCategoryStats[catName] || 0;
        const percentage = currentExpense > 0 ? (current / currentExpense * 100) : 0;
        const change = previous ? ((current - previous) / previous * 100) : 0;

        return {
          name: catName,
          amount: current,
          percentage: percentage,
          change: change
        };
      }).sort((a, b) => b.amount - a.amount);

    
      const topExpenses = currentTransactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 5);

      const topExpensesWithCategories = await Promise.all(
        topExpenses.map(async (t) => {
          const transaction = await Transaction.findByPk(t.id, {
            include: [{ model: Category, as: 'category' }]
          });
          return transaction;
        })
      );

      
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(selectedYear, selectedMonth - i, 1);
        const first = new Date(date.getFullYear(), date.getMonth(), 1);
        const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const transactions = await Transaction.findAll({
          where: {
            userId,
            type: 'expense',
            date: { [Op.between]: [first, last] }
          }
        });

        const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        last6Months.push(total);
      }

      const avgExpense = last6Months.reduce((a, b) => a + b, 0) / last6Months.length;
      const trend = last6Months[5] - last6Months[4];
      const prediction = last6Months[5] + trend;

      const risingCategories = [];
      const fallingCategories = [];

      categoryReport.forEach(cat => {
        if (cat.change > 10) {
          risingCategories.push({ name: cat.name, increase: cat.change });
        } else if (cat.change < -10) {
          fallingCategories.push({ name: cat.name, decrease: Math.abs(cat.change) });
        }
      });

      const trends = {
        avgExpense: avgExpense,
        prediction: prediction > 0 ? prediction : 0,
        trend: trend > 0 ? 'hausse' : 'baisse',
        risingCategories: risingCategories.slice(0, 3),
        fallingCategories: fallingCategories.slice(0, 3)
      };


      res.render('reports/index', {
        title: 'Rapports Financiers',
        user: req.session.user,
        selectedMonth: selectedMonth + 1,
        selectedYear: selectedYear,
        monthName: firstDay.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        summary,
        categoryReport,
        topExpenses: topExpensesWithCategories,
        trends
      });

    } catch (error) {
      console.error('Erreur rapport:', error);
      res.status(500).send('Erreur lors de la génération du rapport: ' + error.message);
    }
  },

  // ============================================
  // EXPORT PDF
  // ============================================
  exportPDF: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { month, year } = req.query;
      
      const now = new Date();
      const selectedMonth = month ? parseInt(month) - 1 : now.getMonth();
      const selectedYear = year ? parseInt(year) : now.getFullYear();
      
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const prevFirstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const prevLastDay = new Date(selectedYear, selectedMonth, 0);

      // Récupération des données (même logique que index)
      const currentTransactions = await Transaction.findAll({
        where: {
          userId,
          date: { [Op.between]: [firstDay, lastDay] }
        }
      });

      const prevTransactions = await Transaction.findAll({
        where: {
          userId,
          date: { [Op.between]: [prevFirstDay, prevLastDay] }
        }
      });

      const currentIncome = currentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const currentExpense = currentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const prevIncome = prevTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const prevExpense = prevTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const summary = {
        income: currentIncome,
        expense: currentExpense,
        balance: currentIncome - currentExpense,
        incomeChange: prevIncome ? ((currentIncome - prevIncome) / prevIncome * 100) : 0,
        expenseChange: prevExpense ? ((currentExpense - prevExpense) / prevExpense * 100) : 0
      };

      // Rapport par catégorie
      const transactionsWithCategories = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          date: { [Op.between]: [firstDay, lastDay] }
        },
        include: [{ model: Category, as: 'category' }]
      });

      const prevTransactionsWithCategories = await Transaction.findAll({
        where: {
          userId,
          type: 'expense',
          date: { [Op.between]: [prevFirstDay, prevLastDay] }
        },
        include: [{ model: Category, as: 'category' }]
      });

      const categoryStats = {};
      const prevCategoryStats = {};

      transactionsWithCategories.forEach(t => {
        if (t.category) {
          const catName = t.category.name;
          categoryStats[catName] = (categoryStats[catName] || 0) + parseFloat(t.amount);
        }
      });

      prevTransactionsWithCategories.forEach(t => {
        if (t.category) {
          const catName = t.category.name;
          prevCategoryStats[catName] = (prevCategoryStats[catName] || 0) + parseFloat(t.amount);
        }
      });

      const categoryReport = Object.keys(categoryStats).map(catName => {
        const current = categoryStats[catName];
        const previous = prevCategoryStats[catName] || 0;
        const percentage = currentExpense > 0 ? (current / currentExpense * 100) : 0;
        const change = previous ? ((current - previous) / previous * 100) : 0;

        return {
          name: catName,
          amount: current,
          percentage: percentage,
          change: change
        };
      }).sort((a, b) => b.amount - a.amount);

      // Top 5 dépenses
      const topExpenses = currentTransactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 5);

      const topExpensesWithCategories = await Promise.all(
        topExpenses.map(async (t) => {
          const transaction = await Transaction.findByPk(t.id, {
            include: [{ model: Category, as: 'category' }]
          });
          return transaction;
        })
      );

      // Tendances
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(selectedYear, selectedMonth - i, 1);
        const first = new Date(date.getFullYear(), date.getMonth(), 1);
        const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const transactions = await Transaction.findAll({
          where: {
            userId,
            type: 'expense',
            date: { [Op.between]: [first, last] }
          }
        });

        const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        last6Months.push(total);
      }

      const avgExpense = last6Months.reduce((a, b) => a + b, 0) / last6Months.length;
      const trend = last6Months[5] - last6Months[4];
      const prediction = last6Months[5] + trend;

      const trends = {
        avgExpense: avgExpense,
        prediction: prediction > 0 ? prediction : 0,
        trend: trend > 0 ? 'hausse' : 'baisse'
      };

      
      const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            color: #1f2937;
            line-height: 1.6;
        }
        .header {
            border-bottom: 4px solid #7c3aed;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 { 
            color: #7c3aed; 
            font-size: 32px;
            margin-bottom: 10px;
        }
        .meta-info {
            color: #6b7280;
            font-size: 14px;
        }
        h2 { 
            color: #374151; 
            margin: 30px 0 15px;
            font-size: 22px;
            border-left: 4px solid #7c3aed;
            padding-left: 15px;
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            margin: 20px 0 40px; 
        }
        .card { 
            padding: 25px; 
            border-radius: 12px; 
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card-income { background: linear-gradient(135deg, #10b981, #059669); }
        .card-expense { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .card-balance { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .card-label {
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .card-value {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .card-change {
            font-size: 13px;
            opacity: 0.95;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        th, td { 
            padding: 14px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
        }
        th { 
            background-color: #f9fafb; 
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td { font-size: 14px; }
        tr:hover { background-color: #fafafa; }
        .expense-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 18px; 
            background: #f9fafb; 
            border-radius: 10px; 
            margin: 12px 0;
            border-left: 4px solid #ef4444;
        }
        .expense-rank {
            width: 35px;
            height: 35px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
        }
        .expense-details {
            flex: 1;
        }
        .expense-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }
        .expense-category {
            font-size: 13px;
            color: #6b7280;
        }
        .expense-amount {
            font-size: 18px;
            font-weight: bold;
            color: #ef4444;
        }
        .trends-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .trend-box {
            padding: 20px;
            background: #f9fafb;
            border-radius: 10px;
            border-left: 4px solid #7c3aed;
        }
        .trend-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .trend-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
        }
        .footer { 
            margin-top: 50px; 
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center; 
            color: #6b7280; 
            font-size: 12px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-purple {
            background: #ede9fe;
            color: #7c3aed;
        }
        .text-red { color: #ef4444; }
        .text-green { color: #10b981; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <h1> Rapport Financier Détaillé</h1>
        <div class="meta-info">
            <strong>Période :</strong> ${firstDay.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} | 
            <strong>Généré le :</strong> ${new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} | 
            <strong>Utilisateur :</strong> ${req.session.user.firstName} ${req.session.user.lastName}
        </div>
    </div>
    
    <h2> Résumé Mensuel</h2>
    <div class="summary-grid">
        <div class="card card-income">
            <div class="card-label">Revenus Totaux</div>
            <div class="card-value">${summary.income.toFixed(2)} MAD</div>
            <div class="card-change">
                ${summary.incomeChange >= 0 ? '↑' : '↓'} ${Math.abs(summary.incomeChange).toFixed(1)}% vs mois précédent
            </div>
        </div>
        <div class="card card-expense">
            <div class="card-label">Dépenses Totales</div>
            <div class="card-value">${summary.expense.toFixed(2)} MAD</div>
            <div class="card-change">
                ${summary.expenseChange >= 0 ? '↑' : '↓'} ${Math.abs(summary.expenseChange).toFixed(1)}% vs mois précédent
            </div>
        </div>
        <div class="card card-balance">
            <div class="card-label">Solde Net</div>
            <div class="card-value">${summary.balance.toFixed(2)} MAD</div>
            <div class="card-change">${summary.balance >= 0 ? 'Excédent budgétaire' : 'Déficit budgétaire'}</div>
        </div>
    </div>
    
    <h2> Dépenses par Catégorie</h2>
    ${categoryReport.length > 0 ? `
    <table>
        <thead>
            <tr>
                <th>Catégorie</th>
                <th style="text-align:right;">Montant (MAD)</th>
                <th style="text-align:right;">% du Total</th>
                <th style="text-align:right;">Évolution</th>
            </tr>
        </thead>
        <tbody>
            ${categoryReport.map(cat => `
                <tr>
                    <td><strong>${cat.name}</strong></td>
                    <td style="text-align:right;">${cat.amount.toFixed(2)} MAD</td>
                    <td style="text-align:right;">
                        <span class="badge badge-purple">${cat.percentage.toFixed(1)}%</span>
                    </td>
                    <td style="text-align:right;" class="${cat.change >= 0 ? 'text-red' : 'text-green'}">
                        ${cat.change >= 0 ? '↑' : '↓'} ${Math.abs(cat.change).toFixed(1)}%
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    ` : '<p style="color:#6b7280; font-style:italic;">Aucune dépense catégorisée ce mois-ci.</p>'}
    
    <div class="page-break"></div>
    
    <h2> Top 5 des Plus Grosses Dépenses</h2>
    ${topExpensesWithCategories.length > 0 ? topExpensesWithCategories.map((t, i) => `
        <div class="expense-item">
            <div style="display:flex; align-items:center; flex:1;">
                <div class="expense-rank">${i + 1}</div>
                <div class="expense-details">
                    <div class="expense-title">${t.description || 'Sans description'}</div>
                    <div class="expense-category">
                        ${t.category ? t.category.name : 'Non catégorisé'} • 
                        ${new Date(t.date).toLocaleDateString('fr-FR')}
                    </div>
                </div>
            </div>
            <div class="expense-amount">${parseFloat(t.amount).toFixed(2)} MAD</div>
        </div>
    `).join('') : '<p style="color:#6b7280; font-style:italic;">Aucune dépense enregistrée ce mois-ci.</p>'}
    
    <h2> Tendances et Prédictions</h2>
    <div class="trends-grid">
        <div class="trend-box">
            <div class="trend-label">Moyenne Mensuelle (6 mois)</div>
            <div class="trend-value">${trends.avgExpense.toFixed(2)} MAD</div>
        </div>
        <div class="trend-box">
            <div class="trend-label">Prédiction Mois Prochain</div>
            <div class="trend-value">${trends.prediction.toFixed(2)} MAD</div>
        </div>
    </div>
    <div style="margin-top:20px; padding:20px; background:${trends.trend === 'hausse' ? '#fee2e2' : '#d1fae5'}; border-radius:10px; border-left:4px solid ${trends.trend === 'hausse' ? '#ef4444' : '#10b981'};">
        <strong style="color:${trends.trend === 'hausse' ? '#991b1b' : '#065f46'};">
            Tendance Générale : ${trends.trend === 'hausse' ? '📈 En Hausse' : '📉 En Baisse'}
        </strong>
        <p style="margin-top:8px; color:#374151; font-size:14px;">
            ${trends.trend === 'hausse' 
              ? 'Vos dépenses augmentent. Envisagez de revoir votre budget.' 
              : 'Vos dépenses diminuent. Continuez sur cette voie !'}
        </p>
    </div>
    
    <div class="footer">
        <p><strong>FinSolutions</strong> - Plateforme de Gestion de Budget Personnel</p>
        <p>© ${new Date().getFullYear()} FinSolutions. Rapport généré automatiquement.</p>
        <p style="margin-top:8px; font-size:11px;">
            Ce document est confidentiel et destiné exclusivement à l'usage personnel.
        </p>
    </div>
</body>
</html>
      `;
      
    
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { 
          top: '20px', 
          bottom: '20px', 
          left: '20px', 
          right: '20px' 
        }
      });
      
      await browser.close();
      
      
      const fileName = `rapport-financier-${selectedMonth + 1}-${selectedYear}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(pdf);
      
    } catch (error) {
      console.error('Erreur export PDF:', error);
      res.status(500).send('Erreur lors de la génération du PDF: ' + error.message);
    }
  }
};

module.exports = reportController;