/*
  # Sistema CTR - Schema Inicial

  1. Tabelas Principais
    - `user_profiles` - Perfis de usuário com roles
    - `empresas` - Empresas parceiras e check-up
    - `medicos` - Médicos vinculados às empresas
    - `convenios` - Convênios por empresa
    - `pacientes` - Pacientes do sistema
    - `exames` - Catálogo de exames
    - `encaminhamentos` - Pedidos de exame
    - `checkups` - Baterias de check-up
    - `checkup_itens` - Exames de cada bateria
    - `checkup_pacientes` - Pacientes vinculados aos check-ups

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas no role do usuário
    - Controle de acesso por empresa para parceiros
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'ctr', 'parceiro', 'checkup')),
  empresa_id uuid,
  nome text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('parceiro', 'checkup')),
  cnpj text,
  telefone text,
  email text,
  endereco text,
  ativa boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de médicos
CREATE TABLE IF NOT EXISTS medicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  crm text NOT NULL,
  especialidade text,
  telefone text,
  email text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de convênios
CREATE TABLE IF NOT EXISTS convenios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  codigo text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text NOT NULL,
  nascimento date,
  telefone text,
  email text,
  endereco text,
  empresa_id uuid REFERENCES empresas(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de exames
CREATE TABLE IF NOT EXISTS exames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  codigo text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de encaminhamentos
CREATE TABLE IF NOT EXISTS encaminhamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id uuid REFERENCES medicos(id),
  exame_id uuid REFERENCES exames(id),
  ctr_id uuid REFERENCES user_profiles(id),
  status text NOT NULL DEFAULT 'encaminhado' CHECK (status IN ('encaminhado', 'executado', 'intervencao', 'acompanhamento')),
  tipo text NOT NULL CHECK (tipo IN ('convenio', 'particular')),
  convenio_id uuid REFERENCES convenios(id),
  observacao text,
  detalhes_intervencao text,
  data_execucao timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de check-ups
CREATE TABLE IF NOT EXISTS checkups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de itens do check-up
CREATE TABLE IF NOT EXISTS checkup_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkup_id uuid REFERENCES checkups(id) ON DELETE CASCADE,
  exame_id uuid REFERENCES exames(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Tabela de pacientes do check-up
CREATE TABLE IF NOT EXISTS checkup_pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkup_id uuid REFERENCES checkups(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
  observacao text,
  data_solicitacao timestamptz DEFAULT now(),
  data_conclusao timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_empresa_id ON user_profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_medicos_empresa_id ON medicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_convenios_empresa_id ON convenios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_paciente_id ON encaminhamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_medico_id ON encaminhamentos(medico_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_status ON encaminhamentos(status);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_created_at ON encaminhamentos(created_at);
CREATE INDEX IF NOT EXISTS idx_checkup_itens_checkup_id ON checkup_itens(checkup_id);
CREATE INDEX IF NOT EXISTS idx_checkup_pacientes_checkup_id ON checkup_pacientes(checkup_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE encaminhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkup_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkup_pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para empresas
CREATE POLICY "Admin can manage all empresas" ON empresas
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "CTR can read all empresas" ON empresas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('ctr', 'admin')
    )
  );

CREATE POLICY "Parceiro can read own empresa" ON empresas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = empresas.id
    )
  );

-- Políticas RLS para médicos
CREATE POLICY "Admin and CTR can manage all medicos" ON medicos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
    )
  );

CREATE POLICY "Parceiro can manage own medicos" ON medicos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = medicos.empresa_id
    )
  );

-- Políticas RLS para convênios
CREATE POLICY "Admin and CTR can read all convenios" ON convenios
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
    )
  );

CREATE POLICY "Parceiro can manage own convenios" ON convenios
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = convenios.empresa_id
    )
  );

-- Políticas RLS para pacientes
CREATE POLICY "Admin and CTR can manage all pacientes" ON pacientes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
    )
  );

CREATE POLICY "Parceiro can read related pacientes" ON pacientes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = pacientes.empresa_id
    )
  );

CREATE POLICY "Checkup can manage own pacientes" ON pacientes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = pacientes.empresa_id
    )
  );

-- Políticas RLS para exames
CREATE POLICY "All authenticated users can read exames" ON exames
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin and CTR can manage exames" ON exames
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
    )
  );

-- Políticas RLS para encaminhamentos
CREATE POLICY "Admin and CTR can manage all encaminhamentos" ON encaminhamentos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
    )
  );

CREATE POLICY "Parceiro can manage own encaminhamentos" ON encaminhamentos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN medicos m ON m.empresa_id = up.empresa_id
      WHERE up.user_id = auth.uid() AND m.id = encaminhamentos.medico_id
    )
  );

-- Políticas RLS para checkups
CREATE POLICY "Admin and CTR can read all checkups" ON checkups
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
    )
  );

CREATE POLICY "Checkup empresa can manage own checkups" ON checkups
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = checkups.empresa_id
    )
  );

-- Políticas RLS para checkup_itens
CREATE POLICY "Users can read checkup_itens based on checkup access" ON checkup_itens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checkups c
      JOIN user_profiles up ON (
        (up.role IN ('admin', 'ctr')) OR 
        (up.empresa_id = c.empresa_id)
      )
      WHERE c.id = checkup_itens.checkup_id AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Checkup empresa can manage own checkup_itens" ON checkup_itens
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checkups c
      JOIN user_profiles up ON up.empresa_id = c.empresa_id
      WHERE c.id = checkup_itens.checkup_id AND up.user_id = auth.uid()
    )
  );

-- Políticas RLS para checkup_pacientes
CREATE POLICY "Users can read checkup_pacientes based on access" ON checkup_pacientes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checkups c
      JOIN user_profiles up ON (
        (up.role IN ('admin', 'ctr')) OR 
        (up.empresa_id = c.empresa_id)
      )
      WHERE c.id = checkup_pacientes.checkup_id AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Checkup empresa can manage own checkup_pacientes" ON checkup_pacientes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checkups c
      JOIN user_profiles up ON up.empresa_id = c.empresa_id
      WHERE c.id = checkup_pacientes.checkup_id AND up.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicos_updated_at BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_convenios_updated_at BEFORE UPDATE ON convenios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exames_updated_at BEFORE UPDATE ON exames FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encaminhamentos_updated_at BEFORE UPDATE ON encaminhamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkups_updated_at BEFORE UPDATE ON checkups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkup_pacientes_updated_at BEFORE UPDATE ON checkup_pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();