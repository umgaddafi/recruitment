USE recruitment;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE departments;
TRUNCATE TABLE colleges;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. College of Agricultural Economics & Extension
INSERT INTO colleges (name, code) VALUES ('College of Agricultural Economics & Extension', 'CAEE');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Agricultural Economics & Management Technology', 'AEMT', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Sustainable Social Development', 'SSD', 'academic');

-- 2. College of Agronomy
INSERT INTO colleges (name, code) VALUES ('College of Agronomy', 'COA');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Crop Production', 'CP', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Crop & Environmental Protection', 'CEP', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Plant Breeding & Seed Sciences', 'PBSS', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Soil Sciences', 'SS', 'academic');

-- 3. College of Animal Sciences
INSERT INTO colleges (name, code) VALUES ('College of Animal Sciences', 'CAS');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Animal Sciences', 'AS', 'academic');

-- 4. College of Education
INSERT INTO colleges (name, code) VALUES ('College of Education', 'COE');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Adult Education', 'AE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Agricultural Sciences & Education', 'ASE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Biology & Education', 'BE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Business Education', 'BUSE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Chemistry & Education', 'CE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'English & Education', 'EE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Educational Administration & Planning', 'EAP', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Environmental Education', 'ENVE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Entrepreneurship Education', 'ENTE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Guidance & Counseling', 'GC', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Home Economics', 'HE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'History & Archeology Education', 'HAE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Industrial Technical Education', 'ITE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Integrated Science & Education', 'ISE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Mathematics/Computer Science & Education', 'MCSE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Statistics/Computer Science & Education', 'SCSE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Mathematics/Statistics & Education', 'MSE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Physics & Education', 'PE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Pre-Primary Education (Social Studies)', 'PPES', 'academic');

-- 5. College of Biological Sciences
INSERT INTO colleges (name, code) VALUES ('College of Biological Sciences', 'CBS');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Biochemistry', 'BCH', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Microbiology', 'MCB', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Plant Science & Bio Technology', 'PSBT', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Zoology', 'ZOO', 'academic');

-- 6. College of Engineering
INSERT INTO colleges (name, code) VALUES ('College of Engineering', 'CENG');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Agricultural & Bio System Engineering', 'ABSE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Civil Engineering', 'CVE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Computer Engineering', 'CPE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Electrical Electronic Engineering', 'EEE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Environmental Engineering', 'ENVE_ENG', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Mechanical Engineering', 'MEE', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Telecommunication Engineering', 'TCE', 'academic');

-- 7. College of Food Technology & Human Ecology
INSERT INTO colleges (name, code) VALUES ('College of Food Technology & Human Ecology', 'CFTHE');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Food Science and Technology', 'FST', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Home Science & Management', 'HSM', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Nutrition & Dietetics', 'ND', 'academic');

-- 8. College of Forestry & Fisheries
INSERT INTO colleges (name, code) VALUES ('College of Forestry & Fisheries', 'CFF');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Fisheries & Aquaculture', 'FA', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Forestry & Wildlife', 'FW', 'academic');

-- 9. College of Management Sciences
INSERT INTO colleges (name, code) VALUES ('College of Management Sciences', 'CMS');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Agribusiness', 'AGB', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Accounting', 'ACC', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Agricultural Marketing & Cooperative', 'AMC', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Banking & Finance', 'BF', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Business Administration', 'BA', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Marketing', 'MKT', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Entrepreneurship', 'ENT', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Procurement', 'PRO', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Public Administration', 'PA', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Library & Information Sciences', 'LIS', 'academic');

-- 10. College of Physical Sciences
INSERT INTO colleges (name, code) VALUES ('College of Physical Sciences', 'CPS');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Chemistry', 'CHM', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Computer Science', 'CSC', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Environmental Sustainability', 'EVS', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Industrial Chemistry', 'ICH', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Industrial Physics', 'IPH', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Mathematics', 'MTH', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Physics', 'PHY', 'academic');
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Statistics', 'STA', 'academic');

-- 11. College of Veterinary Medicine
INSERT INTO colleges (name, code) VALUES ('College of Veterinary Medicine', 'CVM');
SET @c_id = LAST_INSERT_ID();
INSERT INTO departments (college_id, name, code, type) VALUES (@c_id, 'Veterinary Medicine', 'VET', 'academic');

