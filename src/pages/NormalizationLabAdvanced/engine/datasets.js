/**
 * Prebuilt Datasets for Normalization Learning
 * Each dataset includes:
 * - name: display name
 * - tableName: the relation name
 * - columns: array of column names
 * - rows: array of row arrays (UNF form — may contain multi-valued cells)
 * - primaryKey: array of column(s) forming the composite/simple PK
 * - functionalDependencies: array of { from: [...], to: [...] }
 * - description: what this dataset demonstrates
 */

export const datasets = {
  college: {
    id: 'college',
    name: 'College Dataset',
    tableName: 'StudentCourses',
    description: 'Students enrolled in courses with professors and departments',
    columns: ['StudentID', 'StudentName', 'Course', 'Professor', 'Department'],
    rows: [
      ['S101', 'Alice', 'DBMS', 'Dr. Smith', 'CS'],
      ['S101', 'Alice', 'OS', 'Dr. Lee', 'CS'],
      ['S102', 'Bob', 'DBMS', 'Dr. Smith', 'CS'],
      ['S102', 'Bob', 'Networks', 'Dr. Patel', 'IT'],
      ['S103', 'Charlie', 'OS', 'Dr. Lee', 'CS'],
      ['S103', 'Charlie', 'AI', 'Dr. Kumar', 'CS'],
      ['S104', 'Diana', 'Networks', 'Dr. Patel', 'IT'],
      ['S104', 'Diana', 'DBMS', 'Dr. Smith', 'CS'],
    ],
    primaryKey: ['StudentID', 'Course'],
    functionalDependencies: [
      { from: ['StudentID'], to: ['StudentName'] },
      { from: ['Course'], to: ['Professor'] },
      { from: ['Professor'], to: ['Department'] },
      { from: ['StudentID', 'Course'], to: ['StudentName', 'Professor', 'Department'] },
    ],
    // Normalization breakdown:
    // Partial deps: StudentName depends only on StudentID (part of composite PK)
    //               Professor depends only on Course (part of composite PK)
    // Transitive dep: Department depends on Professor (non-key → non-key)
  },

  company: {
    id: 'company',
    name: 'Company Dataset',
    tableName: 'EmployeeProjects',
    description: 'Employees assigned to projects with managers and departments',
    columns: ['EmployeeID', 'EmployeeName', 'Project', 'Manager', 'Department'],
    rows: [
      ['E01', 'John', 'Alpha', 'Mr. Wilson', 'Engineering'],
      ['E01', 'John', 'Beta', 'Ms. Davis', 'Marketing'],
      ['E02', 'Sarah', 'Alpha', 'Mr. Wilson', 'Engineering'],
      ['E02', 'Sarah', 'Gamma', 'Mr. Chen', 'Engineering'],
      ['E03', 'Mike', 'Beta', 'Ms. Davis', 'Marketing'],
      ['E03', 'Mike', 'Delta', 'Mr. Wilson', 'Engineering'],
      ['E04', 'Emma', 'Gamma', 'Mr. Chen', 'Engineering'],
      ['E04', 'Emma', 'Alpha', 'Mr. Wilson', 'Engineering'],
    ],
    primaryKey: ['EmployeeID', 'Project'],
    functionalDependencies: [
      { from: ['EmployeeID'], to: ['EmployeeName'] },
      { from: ['Project'], to: ['Manager'] },
      { from: ['Manager'], to: ['Department'] },
      { from: ['EmployeeID', 'Project'], to: ['EmployeeName', 'Manager', 'Department'] },
    ],
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce Dataset',
    tableName: 'OrderDetails',
    description: 'Customer orders with products and supplier information',
    columns: ['OrderID', 'CustomerName', 'Product', 'Supplier', 'Price'],
    rows: [
      ['ORD1', 'Alice', 'Laptop', 'TechCorp', '999'],
      ['ORD1', 'Alice', 'Mouse', 'GadgetInc', '29'],
      ['ORD2', 'Bob', 'Laptop', 'TechCorp', '999'],
      ['ORD2', 'Bob', 'Keyboard', 'GadgetInc', '79'],
      ['ORD3', 'Charlie', 'Phone', 'TechCorp', '699'],
      ['ORD3', 'Charlie', 'Mouse', 'GadgetInc', '29'],
      ['ORD4', 'Alice', 'Tablet', 'TechCorp', '499'],
      ['ORD4', 'Alice', 'Keyboard', 'GadgetInc', '79'],
    ],
    primaryKey: ['OrderID', 'Product'],
    functionalDependencies: [
      { from: ['OrderID'], to: ['CustomerName'] },
      { from: ['Product'], to: ['Supplier', 'Price'] },
      { from: ['OrderID', 'Product'], to: ['CustomerName', 'Supplier', 'Price'] },
    ],
  },

  hospital: {
    id: 'hospital',
    name: 'Hospital Dataset',
    tableName: 'PatientRecords',
    description: 'Patient admissions with doctor and department assignments',
    columns: ['PatientID', 'PatientName', 'Doctor', 'Department', 'Room'],
    rows: [
      ['P01', 'Raj', 'Dr. Mehta', 'Cardiology', 'R101'],
      ['P01', 'Raj', 'Dr. Sharma', 'Neurology', 'R205'],
      ['P02', 'Priya', 'Dr. Mehta', 'Cardiology', 'R102'],
      ['P02', 'Priya', 'Dr. Gupta', 'Orthopedics', 'R301'],
      ['P03', 'Amit', 'Dr. Sharma', 'Neurology', 'R206'],
      ['P03', 'Amit', 'Dr. Mehta', 'Cardiology', 'R103'],
      ['P04', 'Neha', 'Dr. Gupta', 'Orthopedics', 'R302'],
      ['P04', 'Neha', 'Dr. Sharma', 'Neurology', 'R207'],
    ],
    primaryKey: ['PatientID', 'Doctor'],
    functionalDependencies: [
      { from: ['PatientID'], to: ['PatientName'] },
      { from: ['Doctor'], to: ['Department'] },
      { from: ['PatientID', 'Doctor'], to: ['PatientName', 'Department', 'Room'] },
    ],
  },

  bigdata: {
    id: 'bigdata',
    name: 'Big Data Sales',
    tableName: 'GlobalSalesMetrics',
    description: 'Massive enterprise dataset spanning regions, stores, products, and categories.',
    columns: ['Region', 'Country', 'StoreID', 'StoreManager', 'ProductID', 'ProductName', 'Category', 'Supplier', 'UnitsSold'],
    rows: [
      ['North America', 'USA', 'ST-101', 'Alice Johnson', 'P-1', 'Ultra Laptop', 'Electronics', 'TechCorp', '520'],
      ['North America', 'USA', 'ST-101', 'Alice Johnson', 'P-2', 'Ergo Mouse', 'Electronics', 'TechCorp', '1250'],
      ['North America', 'Canada', 'ST-102', 'Bob Smith', 'P-1', 'Ultra Laptop', 'Electronics', 'TechCorp', '410'],
      ['Europe', 'UK', 'ST-201', 'Charlie Brown', 'P-3', 'Oak Desk', 'Furniture', 'WoodCrafters', '85'],
      ['Europe', 'UK', 'ST-201', 'Charlie Brown', 'P-4', 'Office Chair', 'Furniture', 'WoodCrafters', '210'],
      ['Europe', 'Germany', 'ST-202', 'Diana Prince', 'P-2', 'Ergo Mouse', 'Electronics', 'TechCorp', '980'],
      ['Asia', 'Japan', 'ST-301', 'Evan Lee', 'P-1', 'Ultra Laptop', 'Electronics', 'TechCorp', '630'],
      ['Asia', 'Japan', 'ST-301', 'Evan Lee', 'P-5', 'HDMI Cable', 'Accessories', 'CableWorks', '3200'],
    ],
    primaryKey: ['StoreID', 'ProductID'],
    functionalDependencies: [
      { from: ['StoreID'], to: ['StoreManager', 'Country'] },
      { from: ['ProductID'], to: ['ProductName', 'Category', 'Supplier'] },
      { from: ['Country'], to: ['Region'] },
      { from: ['StoreID', 'ProductID'], to: ['StoreManager', 'Country', 'Region', 'ProductName', 'Category', 'Supplier', 'UnitsSold'] },
    ],
  },
}

/**
 * Generate quiz questions from a dataset
 */
export function generateQuizQuestions(dataset) {
  const questions = []
  const pk = dataset.primaryKey
  const fds = dataset.functionalDependencies

  // Q1: Primary key identification
  const pkOptions = []
  pkOptions.push(pk.join(', '))
  // Generate wrong options
  const nonPkCols = dataset.columns.filter(c => !pk.includes(c))
  if (nonPkCols.length >= 1) pkOptions.push(nonPkCols[0])
  if (nonPkCols.length >= 2) pkOptions.push(nonPkCols.slice(0, 2).join(', '))
  if (pk.length > 1) pkOptions.push(pk[0])
  questions.push({
    id: 'q1',
    question: `What is the primary key of the "${dataset.tableName}" table?`,
    options: shuffleArray([...new Set(pkOptions)]),
    correctAnswer: pk.join(', '),
    explanation: `The primary key is (${pk.join(', ')}) because it uniquely identifies each row in the table.`,
    topic: 'Primary Key',
  })

  // Q2: Partial dependency identification
  const partialDeps = fds.filter(fd => {
    if (pk.length <= 1) return false
    const fromSet = new Set(fd.from)
    const pkSet = new Set(pk)
    return fd.from.length < pk.length &&
      fd.from.every(f => pkSet.has(f)) &&
      !fd.to.every(t => pkSet.has(t))
  })

  if (partialDeps.length > 0) {
    const pd = partialDeps[0]
    const fdStr = `${pd.from.join(', ')} → ${pd.to.join(', ')}`
    const wrongFds = fds.filter(f => f !== pd).map(f => `${f.from.join(', ')} → ${f.to.join(', ')}`)
    questions.push({
      id: 'q2',
      question: 'Which of the following is a partial dependency?',
      options: shuffleArray([fdStr, ...wrongFds.slice(0, 3)]),
      correctAnswer: fdStr,
      explanation: `"${fdStr}" is a partial dependency because ${pd.from.join(', ')} is only part of the composite primary key (${pk.join(', ')}).`,
      topic: 'Partial Dependency',
    })
  }

  // Q3: Transitive dependency
  const transitiveDeps = fds.filter(fd => {
    const pkSet = new Set(pk)
    return !fd.from.some(f => pkSet.has(f)) &&
      !fd.to.some(t => pkSet.has(t))
  })

  if (transitiveDeps.length > 0) {
    const td = transitiveDeps[0]
    const tdStr = `${td.from.join(', ')} → ${td.to.join(', ')}`
    questions.push({
      id: 'q3',
      question: 'Which of the following represents a transitive dependency?',
      options: shuffleArray([
        tdStr,
        `${pk.join(', ')} → ${td.from.join(', ')}`,
        `${td.to.join(', ')} → ${pk.join(', ')}`,
        `${pk.join(', ')} → ${td.to.join(', ')}`,
      ]),
      correctAnswer: tdStr,
      explanation: `"${tdStr}" is transitive because ${td.from.join(', ')} is a non-key attribute that determines ${td.to.join(', ')}, another non-key attribute.`,
      topic: 'Transitive Dependency',
    })
  }

  // Q4: 1NF question
  questions.push({
    id: 'q4',
    question: 'What is the main requirement for a table to be in First Normal Form (1NF)?',
    options: shuffleArray([
      'All attributes must have atomic (indivisible) values',
      'No partial dependencies on the primary key',
      'No transitive dependencies',
      'All attributes must be part of the primary key',
    ]),
    correctAnswer: 'All attributes must have atomic (indivisible) values',
    explanation: '1NF requires that every column contains only atomic (indivisible) values — no repeating groups or arrays.',
    topic: '1NF',
  })

  // Q5: Number of tables after normalization
  const numTables2NF = partialDeps.length > 0 ? partialDeps.length + 1 : 1
  questions.push({
    id: 'q5',
    question: `After converting to 2NF, how many tables will the "${dataset.tableName}" table be decomposed into?`,
    options: shuffleArray([
      String(numTables2NF),
      String(numTables2NF + 1),
      String(Math.max(1, numTables2NF - 1)),
      String(numTables2NF + 2),
    ]),
    correctAnswer: String(numTables2NF),
    explanation: `Each partial dependency creates a new table, plus the remaining attributes form another table. Total: ${numTables2NF} tables.`,
    topic: '2NF Decomposition',
  })

  return questions
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
