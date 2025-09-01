/*
  # Corrigir políticas RLS para acesso total do admin

  1. Modificações nas Políticas
    - Atualizar todas as políticas para garantir que admin tenha acesso total
    - Simplificar verificações de role para melhor performance
    - Garantir consistência entre todas as tabelas

  2. Segurança
    - Manter RLS habilitado em todas as tabelas
    - Admin tem acesso total a todos os dados
    - CTR tem acesso amplo mas limitado
    - Parceiros e Checkup têm acesso apenas aos seus dados

  3. Performance
    - Otimizar consultas de verificação de role
    - Adicionar índices onde necessário
*/

-- Função auxiliar para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Função auxiliar para verificar se o usuário é CTR ou admin
CREATE OR REPLACE FUNCTION is_ctr_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
  );
$$;

-- Função auxiliar para obter empresa_id do usuário
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT empresa_id FROM user_profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Atualizar políticas da tabela user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Admin can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Atualizar políticas da tabela empresas
DROP POLICY IF EXISTS "Admin can manage all empresas" ON empresas;
DROP POLICY IF EXISTS "CTR can read all empresas" ON empresas;
DROP POLICY IF EXISTS "Parceiro can read own empresa" ON empresas;

CREATE POLICY "Admin can manage all empresas"
  ON empresas
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can read all empresas"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (is_ctr_or_admin());

CREATE POLICY "Parceiro can read own empresa"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = empresas.id
    )
  );

-- Atualizar políticas da tabela medicos
DROP POLICY IF EXISTS "Admin and CTR can manage all medicos" ON medicos;
DROP POLICY IF EXISTS "Parceiro can manage own medicos" ON medicos;

CREATE POLICY "Admin can manage all medicos"
  ON medicos
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can manage all medicos"
  ON medicos
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Parceiro can manage own medicos"
  ON medicos
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = medicos.empresa_id
    )
  );

-- Atualizar políticas da tabela convenios
DROP POLICY IF EXISTS "Admin and CTR can read all convenios" ON convenios;
DROP POLICY IF EXISTS "Parceiro can manage own convenios" ON convenios;

CREATE POLICY "Admin can manage all convenios"
  ON convenios
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can read all convenios"
  ON convenios
  FOR SELECT
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Parceiro can manage own convenios"
  ON convenios
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = convenios.empresa_id
    )
  );

-- Atualizar políticas da tabela pacientes
DROP POLICY IF EXISTS "Admin and CTR can manage all pacientes" ON pacientes;
DROP POLICY IF EXISTS "Checkup can manage own pacientes" ON pacientes;
DROP POLICY IF EXISTS "Parceiro can read related pacientes" ON pacientes;

CREATE POLICY "Admin can manage all pacientes"
  ON pacientes
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can manage all pacientes"
  ON pacientes
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Checkup can manage own pacientes"
  ON pacientes
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = pacientes.empresa_id
    )
  );

CREATE POLICY "Parceiro can read related pacientes"
  ON pacientes
  FOR SELECT
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = pacientes.empresa_id
    )
  );

-- Atualizar políticas da tabela exames
DROP POLICY IF EXISTS "Admin and CTR can manage exames" ON exames;
DROP POLICY IF EXISTS "All authenticated users can read exames" ON exames;

CREATE POLICY "Admin can manage all exames"
  ON exames
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can manage exames"
  ON exames
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "All authenticated users can read exames"
  ON exames
  FOR SELECT
  TO authenticated
  USING (true);

-- Atualizar políticas da tabela encaminhamentos
DROP POLICY IF EXISTS "Admin and CTR can manage all encaminhamentos" ON encaminhamentos;
DROP POLICY IF EXISTS "Parceiro can manage own encaminhamentos" ON encaminhamentos;

CREATE POLICY "Admin can manage all encaminhamentos"
  ON encaminhamentos
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can manage all encaminhamentos"
  ON encaminhamentos
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Parceiro can manage own encaminhamentos"
  ON encaminhamentos
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN medicos m ON m.empresa_id = up.empresa_id
      WHERE up.user_id = auth.uid() AND m.id = encaminhamentos.medico_id
    )
  );

-- Atualizar políticas da tabela checkups
DROP POLICY IF EXISTS "Admin and CTR can read all checkups" ON checkups;
DROP POLICY IF EXISTS "Checkup empresa can manage own checkups" ON checkups;

CREATE POLICY "Admin can manage all checkups"
  ON checkups
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can read all checkups"
  ON checkups
  FOR SELECT
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Checkup empresa can manage own checkups"
  ON checkups
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND empresa_id = checkups.empresa_id
    )
  );

-- Atualizar políticas da tabela checkup_itens
DROP POLICY IF EXISTS "Checkup empresa can manage own checkup_itens" ON checkup_itens;
DROP POLICY IF EXISTS "Users can read checkup_itens based on checkup access" ON checkup_itens;

CREATE POLICY "Admin can manage all checkup_itens"
  ON checkup_itens
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can read all checkup_itens"
  ON checkup_itens
  FOR SELECT
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Checkup empresa can manage own checkup_itens"
  ON checkup_itens
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM checkups c
      JOIN user_profiles up ON up.empresa_id = c.empresa_id
      WHERE c.id = checkup_itens.checkup_id AND up.user_id = auth.uid()
    )
  );

-- Atualizar políticas da tabela checkup_pacientes
DROP POLICY IF EXISTS "Checkup empresa can manage own checkup_pacientes" ON checkup_pacientes;
DROP POLICY IF EXISTS "Users can read checkup_pacientes based on access" ON checkup_pacientes;

CREATE POLICY "Admin can manage all checkup_pacientes"
  ON checkup_pacientes
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "CTR can read all checkup_pacientes"
  ON checkup_pacientes
  FOR SELECT
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'ctr'
    )
  );

CREATE POLICY "Checkup empresa can manage own checkup_pacientes"
  ON checkup_pacientes
  FOR ALL
  TO authenticated
  USING (
    NOT is_admin() AND 
    EXISTS (
      SELECT 1 FROM checkups c
      JOIN user_profiles up ON up.empresa_id = c.empresa_id
      WHERE c.id = checkup_pacientes.checkup_id AND up.user_id = auth.uid()
    )
  );

-- Criar índices para otimizar performance das consultas de autorização
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_user_id ON user_profiles(role, user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_empresa_role ON user_profiles(empresa_id, role);

-- Comentários para documentação
COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual é administrador';
COMMENT ON FUNCTION is_ctr_or_admin() IS 'Verifica se o usuário atual é CTR ou administrador';
COMMENT ON FUNCTION get_user_empresa_id() IS 'Retorna o empresa_id do usuário atual';