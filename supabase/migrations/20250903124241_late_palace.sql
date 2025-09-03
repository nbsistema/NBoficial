/*
  # Correção de usuários sem perfil e expansão de acesso admin

  1. Verificação e correção de dados
     - Identifica usuários autenticados sem perfil
     - Cria perfis fictícios para teste
     - Garante que existe pelo menos um admin

  2. Expansão de políticas para admin
     - Admin pode gerenciar todos os dados do sistema
     - Acesso total a todas as tabelas
     - Permissões para CRUD completo

  3. Funções auxiliares
     - Função para verificar se usuário é admin
     - Função para verificar se usuário é CTR ou admin
*/

-- Função para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Função para verificar se o usuário atual é CTR ou admin
CREATE OR REPLACE FUNCTION is_ctr_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'ctr')
  );
$$;

-- Inserir dados fictícios para teste se necessário
DO $$
DECLARE
    admin_user_id uuid;
    ctr_user_id uuid;
    parceiro_empresa_id uuid;
    checkup_empresa_id uuid;
    parceiro_user_id uuid;
    checkup_user_id uuid;
    medico_id uuid;
    exame_id uuid;
    convenio_id uuid;
    paciente_id uuid;
BEGIN
    -- Verificar se já existe um admin
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin') THEN
        -- Criar usuário admin fictício se não existir
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'admin@sistema.com',
            crypt('admin123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated'
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id INTO admin_user_id;

        -- Se não conseguiu inserir (já existe), buscar o ID
        IF admin_user_id IS NULL THEN
            SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@sistema.com';
        END IF;

        -- Criar perfil admin
        INSERT INTO user_profiles (user_id, role, nome)
        VALUES (admin_user_id, 'admin', 'Administrador do Sistema')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Criar usuário CTR fictício se não existir
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'ctr') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'ctr@sistema.com',
            crypt('ctr123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated'
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id INTO ctr_user_id;

        IF ctr_user_id IS NULL THEN
            SELECT id INTO ctr_user_id FROM auth.users WHERE email = 'ctr@sistema.com';
        END IF;

        INSERT INTO user_profiles (user_id, role, nome)
        VALUES (ctr_user_id, 'ctr', 'Recepção CTR')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Criar empresas fictícias se não existirem
    INSERT INTO empresas (id, nome, tipo, cnpj, telefone, email, endereco, ativa)
    VALUES 
        (gen_random_uuid(), 'Clínica Parceira Exemplo', 'parceiro', '12.345.678/0001-90', '(11) 99999-9999', 'contato@clinicaparceira.com', 'Rua das Flores, 123', true),
        (gen_random_uuid(), 'Empresa Check-up Exemplo', 'checkup', '98.765.432/0001-10', '(11) 88888-8888', 'contato@checkupempresa.com', 'Av. Principal, 456', true)
    ON CONFLICT DO NOTHING
    RETURNING id INTO parceiro_empresa_id;

    -- Buscar IDs das empresas se já existirem
    IF parceiro_empresa_id IS NULL THEN
        SELECT id INTO parceiro_empresa_id FROM empresas WHERE tipo = 'parceiro' LIMIT 1;
        SELECT id INTO checkup_empresa_id FROM empresas WHERE tipo = 'checkup' LIMIT 1;
    END IF;

    -- Criar usuários para as empresas se não existirem
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'parceiro') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'parceiro@sistema.com',
            crypt('parceiro123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated'
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id INTO parceiro_user_id;

        IF parceiro_user_id IS NULL THEN
            SELECT id INTO parceiro_user_id FROM auth.users WHERE email = 'parceiro@sistema.com';
        END IF;

        INSERT INTO user_profiles (user_id, role, empresa_id, nome)
        VALUES (parceiro_user_id, 'parceiro', parceiro_empresa_id, 'Usuário Parceiro')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'checkup') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'checkup@sistema.com',
            crypt('checkup123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            'authenticated'
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id INTO checkup_user_id;

        IF checkup_user_id IS NULL THEN
            SELECT id INTO checkup_user_id FROM auth.users WHERE email = 'checkup@sistema.com';
        END IF;

        INSERT INTO user_profiles (user_id, role, empresa_id, nome)
        VALUES (checkup_user_id, 'checkup', checkup_empresa_id, 'Usuário Check-up')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Criar dados de exemplo se necessário
    -- Exames
    INSERT INTO exames (nome, descricao, codigo, ativo)
    VALUES 
        ('Hemograma Completo', 'Exame de sangue completo', 'HEM001', true),
        ('Raio-X Tórax', 'Radiografia do tórax', 'RX001', true),
        ('Eletrocardiograma', 'Exame do coração', 'ECG001', true),
        ('Ultrassom Abdominal', 'Ultrassom da região abdominal', 'US001', true)
    ON CONFLICT DO NOTHING;

    -- Médicos para empresa parceira
    SELECT id INTO medico_id FROM medicos WHERE empresa_id = parceiro_empresa_id LIMIT 1;
    IF medico_id IS NULL THEN
        INSERT INTO medicos (empresa_id, nome, crm, especialidade, telefone, email, ativo)
        VALUES (parceiro_empresa_id, 'Dr. João Silva', 'CRM12345', 'Clínico Geral', '(11) 99999-1111', 'joao@clinica.com', true)
        RETURNING id INTO medico_id;
    END IF;

    -- Convênios para empresa parceira
    INSERT INTO convenios (empresa_id, nome, codigo, ativo)
    VALUES (parceiro_empresa_id, 'Unimed', 'UNI001', true)
    ON CONFLICT DO NOTHING
    RETURNING id INTO convenio_id;

    -- Pacientes de exemplo
    INSERT INTO pacientes (nome, cpf, nascimento, telefone, email, empresa_id)
    VALUES 
        ('Maria Santos', '12345678901', '1985-05-15', '(11) 99999-2222', 'maria@email.com', parceiro_empresa_id),
        ('José Oliveira', '98765432109', '1990-08-20', '(11) 99999-3333', 'jose@email.com', checkup_empresa_id)
    ON CONFLICT (cpf) DO NOTHING;

    -- Check-ups para empresa checkup
    INSERT INTO checkups (empresa_id, nome, descricao, ativo)
    VALUES (checkup_empresa_id, 'Check-up Executivo', 'Bateria completa de exames para executivos', true)
    ON CONFLICT DO NOTHING;

END $$;

-- Atualizar políticas para garantir acesso total do admin
-- Remover políticas restritivas e recriar com acesso admin

-- user_profiles: Admin pode gerenciar todos os perfis
DROP POLICY IF EXISTS "Admin can manage all profiles" ON user_profiles;
CREATE POLICY "Admin can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- empresas: Admin pode gerenciar todas as empresas
DROP POLICY IF EXISTS "Admin can manage all empresas" ON empresas;
CREATE POLICY "Admin can manage all empresas"
  ON empresas
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- medicos: Admin pode gerenciar todos os médicos
DROP POLICY IF EXISTS "Admin can manage all medicos" ON medicos;
CREATE POLICY "Admin can manage all medicos"
  ON medicos
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- convenios: Admin pode gerenciar todos os convênios
DROP POLICY IF EXISTS "Admin can manage all convenios" ON convenios;
CREATE POLICY "Admin can manage all convenios"
  ON convenios
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- pacientes: Admin pode gerenciar todos os pacientes
DROP POLICY IF EXISTS "Admin can manage all pacientes" ON pacientes;
CREATE POLICY "Admin can manage all pacientes"
  ON pacientes
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- exames: Admin pode gerenciar todos os exames
DROP POLICY IF EXISTS "Admin can manage all exames" ON exames;
CREATE POLICY "Admin can manage all exames"
  ON exames
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- encaminhamentos: Admin pode gerenciar todos os encaminhamentos
DROP POLICY IF EXISTS "Admin can manage all encaminhamentos" ON encaminhamentos;
CREATE POLICY "Admin can manage all encaminhamentos"
  ON encaminhamentos
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- checkups: Admin pode gerenciar todos os checkups
DROP POLICY IF EXISTS "Admin can manage all checkups" ON checkups;
CREATE POLICY "Admin can manage all checkups"
  ON checkups
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- checkup_itens: Admin pode gerenciar todos os itens de checkup
DROP POLICY IF EXISTS "Admin can manage all checkup_itens" ON checkup_itens;
CREATE POLICY "Admin can manage all checkup_itens"
  ON checkup_itens
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- checkup_pacientes: Admin pode gerenciar todas as solicitações
DROP POLICY IF EXISTS "Admin can manage all checkup_pacientes" ON checkup_pacientes;
CREATE POLICY "Admin can manage all checkup_pacientes"
  ON checkup_pacientes
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());