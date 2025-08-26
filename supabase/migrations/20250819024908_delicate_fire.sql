/*
  # Dados Iniciais do Sistema CTR

  1. Exames básicos
  2. Usuário admin padrão
  3. Empresas de exemplo
*/

-- Inserir exames básicos
INSERT INTO exames (nome, descricao, codigo) VALUES
('Hemograma Completo', 'Exame de sangue completo', 'HEM001'),
('Glicemia de Jejum', 'Dosagem de glicose no sangue', 'GLI001'),
('Colesterol Total', 'Dosagem de colesterol total', 'COL001'),
('Triglicerídeos', 'Dosagem de triglicerídeos', 'TRI001'),
('Creatinina', 'Função renal', 'CRE001'),
('Ureia', 'Função renal', 'URE001'),
('Ácido Úrico', 'Dosagem de ácido úrico', 'ACI001'),
('TSH', 'Hormônio da tireoide', 'TSH001'),
('T4 Livre', 'Hormônio da tireoide', 'T4L001'),
('Raio-X Tórax', 'Radiografia do tórax', 'RXT001'),
('Eletrocardiograma', 'ECG de repouso', 'ECG001'),
('Ultrassom Abdome', 'Ultrassonografia abdominal', 'USA001'),
('Mamografia', 'Exame das mamas', 'MAM001'),
('Papanicolau', 'Exame preventivo', 'PAP001'),
('PSA', 'Antígeno prostático específico', 'PSA001')
ON CONFLICT DO NOTHING;

-- Inserir empresas de exemplo
INSERT INTO empresas (nome, tipo, cnpj) VALUES
('Clínica Médica São Paulo', 'parceiro', '12.345.678/0001-90'),
('Hospital Santa Maria', 'parceiro', '98.765.432/0001-10'),
('Empresa ABC Ltda', 'checkup', '11.222.333/0001-44'),
('Indústria XYZ S.A.', 'checkup', '55.666.777/0001-88')
ON CONFLICT DO NOTHING;