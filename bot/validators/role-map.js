// role-map.js
module.exports = function mapRole(input) {
    const i = input.trim().toLowerCase();
  
    if (['1', 'field worker', 'volunteer'].includes(i)) return 'Field Worker / Volunteer';
    if (['2', 'karmi', 'karmi mandali'].includes(i)) return 'Karmi Mandali';
    if (['3', 'admin', 'district admin'].includes(i)) return 'District Admin';
    if (['4', 'other', 'misc'].includes(i)) return 'Other';
  
    return null;
  };
  