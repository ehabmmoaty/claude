export function exportToCSV(features) {
  const headers = [
    'Category',
    'Feature Name',
    'Description',
    'Design Team',
    'Design Ready',
    'Priority',
    'T-Shirt Size',
    'Effort Score',
    'Reasoning',
    'Competitor Reference'
  ];

  const rows = features.map(feature => [
    feature.category,
    feature.featureName,
    feature.description,
    feature.designTeam,
    feature.designReady,
    feature.priority,
    feature.tshirtSize,
    feature.effortScore,
    feature.reasoning,
    feature.competitorReference
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if needed
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `feature-catalog-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
