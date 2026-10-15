// pubspec.yaml dependencies necessárias:
// flutter:
//   sdk: flutter
// qr_flutter: ^4.1.0

import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

void main() {
  runApp(const CIEApp());
}

class CIEApp extends StatelessWidget {
  const CIEApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CIE Digital',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF5EBFAE),
        scaffoldBackgroundColor: Colors.white,
      ),
      home: const HomeScreen(),
    );
  }
}

// ==================== TELA INICIAL ====================
class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              children: [
                const SizedBox(height: 60),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFF5EBFAE),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Center(
                        child: Text(
                          'cie',
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w300,
                            color: Colors.white,
                            letterSpacing: -1,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Carteira de',
                          style: TextStyle(
                            fontSize: 13,
                            color: const Color(0xFF5EBFAE),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          'Identificação',
                          style: TextStyle(
                            fontSize: 13,
                            color: const Color(0xFF5EBFAE),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          'Estudantil',
                          style: TextStyle(
                            fontSize: 13,
                            color: const Color(0xFF5EBFAE),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 40),
                Container(
                  width: double.infinity,
                  height: 240,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Positioned(
                        right: 0,
                        top: 20,
                        child: Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            color: const Color(0xFFB8E952),
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                      Positioned(
                        right: 30,
                        bottom: 40,
                        child: Container(
                          width: 160,
                          height: 100,
                          decoration: BoxDecoration(
                            color: const Color(0xFF8DD4C5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.black, width: 2),
                          ),
                        ),
                      ),
                      Positioned(
                        left: 20,
                        top: 30,
                        child: Container(
                          width: 140,
                          height: 180,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.black, width: 3),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                Text(
                  'Garanta sua meia entrada em cinemas,',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
                ),
                Text(
                  'teatros, shows, estádios e muito mais',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
                ),
                Text(
                  'rápido e fácil aqui pelo app.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5EBFAE),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Solicitar Carteirinha', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const LoginScreen()));
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF5EBFAE),
                      side: const BorderSide(color: Color(0xFF5EBFAE), width: 2),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Consultar Carteirinha', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () {},
                  child: Text('Central de Ajuda', style: TextStyle(fontSize: 15, color: const Color(0xFF5EBFAE), fontWeight: FontWeight.w600, decoration: TextDecoration.underline)),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ==================== TELA DE LOGIN ====================
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _cpfController = TextEditingController();
  final _senhaController = TextEditingController();
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Login', style: TextStyle(color: Colors.black87, fontSize: 20, fontWeight: FontWeight.w600)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: const Color(0xFF5EBFAE),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Center(
                      child: Text('cie', style: TextStyle(fontSize: 48, fontWeight: FontWeight.w300, color: Colors.white, letterSpacing: -2)),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Center(
                  child: Text('Carteira de Identificação Estudantil', style: TextStyle(fontSize: 12, color: const Color(0xFF5EBFAE), fontWeight: FontWeight.w500)),
                ),
                const SizedBox(height: 50),
                Text('CPF', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
                const SizedBox(height: 8),
                TextField(
                  controller: _cpfController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    hintText: '000.000.000-00',
                    prefixIcon: Icon(Icons.person_outline, color: const Color(0xFF5EBFAE)),
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: const Color(0xFF5EBFAE), width: 2)),
                  ),
                ),
                const SizedBox(height: 24),
                Text('Senha', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
                const SizedBox(height: 8),
                TextField(
                  controller: _senhaController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    prefixIcon: Icon(Icons.lock_outline, color: const Color(0xFF5EBFAE)),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: Colors.grey[600]),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: const Color(0xFF5EBFAE), width: 2)),
                  ),
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: Text('Esqueci minha senha', style: TextStyle(fontSize: 13, color: const Color(0xFF5EBFAE), fontWeight: FontWeight.w500)),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: () {
                      if (_cpfController.text.isNotEmpty && _senhaController.text.isNotEmpty) {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const MyCardScreen()));
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5EBFAE),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Entrar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: Divider(color: Colors.grey[300])),
                    Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('ou', style: TextStyle(color: Colors.grey[600], fontSize: 13))),
                    Expanded(child: Divider(color: Colors.grey[300])),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF5EBFAE),
                      side: const BorderSide(color: Color(0xFF5EBFAE), width: 2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Criar conta', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _cpfController.dispose();
    _senhaController.dispose();
    super.dispose();
  }
}

// ==================== TELA MINHA CARTEIRINHA ====================
class MyCardScreen extends StatefulWidget {
  const MyCardScreen({Key? key}) : super(key: key);

  @override
  State<MyCardScreen> createState() => _MyCardScreenState();
}

class _MyCardScreenState extends State<MyCardScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF8DD4C5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF8DD4C5),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Minha carteirinha', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500)),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Row(
              children: [
                _buildTabButton('CIE DIGITAL', 0),
                const SizedBox(width: 8),
                _buildTabButton('FRENTE', 1),
                const SizedBox(width: 8),
                _buildTabButton('VERSO', 2),
                const SizedBox(width: 8),
                _buildTabButton('QR CODE', 3),
              ],
            ),
          ),
        ],
      ),
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) => setState(() => _currentPage = index),
        children: const [
          CIEDigitalPage(),
          FrentePage(),
          VersoPage(),
          QRCodePage(),
        ],
      ),
    );
  }

  Widget _buildTabButton(String text, int index) {
    return GestureDetector(
      onTap: () => _pageController.animateToPage(index, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 9,
          color: _currentPage == index ? Colors.white : Colors.white70,
          fontWeight: _currentPage == index ? FontWeight.bold : FontWeight.normal,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}

// ==================== CIE DIGITAL PAGE ====================
class CIEDigitalPage extends StatelessWidget {
  const CIEDigitalPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo CIE grande
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Center(
                  child: Text('cie', style: TextStyle(fontSize: 56, fontWeight: FontWeight.w300, color: const Color(0xFF5EBFAE), letterSpacing: -2)),
                ),
              ),
              const SizedBox(height: 12),
              Text('Carteira de\nIdentificação\nEstudantil', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.w500, height: 1.3)),
              const SizedBox(height: 40),
              
              // Foto e QR Code lado a lado
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Foto
                  Container(
                    width: 120,
                    height: 150,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.person, size: 80, color: Colors.grey[400]),
                  ),
                  const SizedBox(width: 20),
                  // QR Code
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const LoadingScreen()));
                    },
                    child: Container(
                      width: 120,
                      height: 120,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: QrImageView(data: 'https://loading-infinite.app', version: QrVersions.auto, size: 120.0),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),
              
              // Container branco com informações
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoRow('Nome:', 'João Silva dos Santos'),
                    _buildInfoRow('Inst. de Ensino', 'Universidade de São Paulo'),
                    _buildInfoRow('Curso', 'Engenharia da Computação'),
                    _buildInfoRow('Tipo de Curso', 'Graduação'),
                    _buildInfoRow('CPF', '123.456.789-00'),
                    _buildInfoRow('Data de Nasc', '01/01/2000'),
                    _buildInfoRow('Validade', 'Dezembro/2025'),
                    _buildInfoRow('Código de Uso:', '78G-AM4F6'),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              // Texto União dos Estudantes
              Text('UNIÃO DOS ESTUDANTES', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
              const SizedBox(height: 20),
              
              // Botão Certificado
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF6BC4B4),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text('Certificado', style: TextStyle(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w600)),
          ),
          Expanded(
            child: Text(value, style: TextStyle(fontSize: 13, color: Colors.black87)),
          ),
        ],
      ),
    );
  }
}

// ==================== FRENTE PAGE ====================
class FrentePage extends StatelessWidget {
  const FrentePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 340,
        height: 214,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF9FE0D3), Color(0xFF85D4C4)],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 5))],
        ),
        child: Stack(
          children: [
            // Logo UNE canto superior esquerdo
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.language, color: const Color(0xFF5EBFAE), size: 20),
              ),
            ),
            
            // Logo dne canto superior esquerdo
            Positioned(
              top: 12,
              left: 50,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('dne', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w200, color: Colors.white, height: 0.9)),
                  Text('Documento Nacional', style: TextStyle(fontSize: 6, color: Colors.white, height: 1)),
                  Text('do Estudante', style: TextStyle(fontSize: 6, color: Colors.white, height: 1)),
                ],
              ),
            ),
            
            // Logos canto superior direito
            Positioned(
              top: 12,
              right: 12,
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.public, color: const Color(0xFF5EBFAE), size: 16),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.school, color: const Color(0xFF5EBFAE), size: 16),
                  ),
                  const SizedBox(width: 6),
                  Text('ANPG', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
            ),
            
            // Foto
            Positioned(
              top: 60,
              left: 16,
              child: Container(
                width: 70,
                height: 85,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.person, size: 50, color: Colors.grey[400]),
              ),
            ),
            
            // QR Code com label
            Positioned(
              top: 60,
              left: 92,
              child: Column(
                children: [
                  Text('QR Code', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const LoadingScreen())),
                    child: Container(
                      width: 70,
                      height: 70,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: QrImageView(data: 'https://loading-infinite.app', size: 70),
                    ),
                  ),
                ],
              ),
            ),
            
            // Microtexto
            Positioned(
              top: 64,
              left: 168,
              child: Text('Microletras', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600)),
            ),
            
            // Informações do lado direito
            Positioned(
              top: 78,
              left: 168,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('VITÓRIA BATISTA DE CASTRO', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.2)),
                  const SizedBox(height: 2),
                  Text('UNIVERSIDADE DE SÃO PAULO', style: TextStyle(fontSize: 7, color: Colors.black87, height: 1.1)),
                  Text('GESTÃO AMBIENTAL', style: TextStyle(fontSize: 7, color: Colors.black87, height: 1.1)),
                  Text('GRADUAÇÃO', style: TextStyle(fontSize: 7, color: Colors.black87, height: 1.1)),
                  const SizedBox(height: 4),
                  Text('CPF: 222.222.222-22', style: TextStyle(fontSize: 6, color: Colors.black87, height: 1.1)),
                  Text('RG: 33.333.333-33', style: TextStyle(fontSize: 6, color: Colors.black87, height: 1.1)),
                  Text('DATA DE NASC. 01/11/2003', style: TextStyle(fontSize: 6, color: Colors.black87, height: 1.1)),
                ],
              ),
            ),
            
            // Texto na parte inferior esquerda
            Positioned(
              bottom: 32,
              left: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Serviço de Atendimento ao Estudante', style: TextStyle(fontSize: 6, color: Colors.black54, height: 1)),
                  Text('sae.documentodoestudante.com.br', style: TextStyle(fontSize: 6, color: Colors.black54, height: 1)),
                ],
              ),
            ),
            
            // Código de uso com label
            Positioned(
              bottom: 42,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Código', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                  Text('de uso', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                  const SizedBox(height: 2),
                  Text('COD. 01/TO8A', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
            ),
            
            // Selo de validade
            Positioned(
              bottom: 8,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.black, width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle_outline, size: 12, color: Colors.black),
                    const SizedBox(width: 4),
                    Text('VALIDADE\nMEIA-ENTRADA', style: TextStyle(fontSize: 5, fontWeight: FontWeight.bold, color: Colors.black, height: 1.2)),
                  ],
                ),
              ),
            ),
            
            // Trama de segurança
            Positioned(
              bottom: 28,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Trama de', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                  Text('segurança', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                ],
              ),
            ),
            
            // Ano 2025
            Positioned(
              bottom: 8,
              right: 12,
              child: Text('2025', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w300, color: Color(0xFFE894BC), letterSpacing: 1)),
            ),
          ],
        ),
      ),
    );
  }
}

// ==================== VERSO PAGE ====================
class VersoPage extends StatelessWidget {
  const VersoPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 340,
        height: 214,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF9FE0D3), Color(0xFF85D4C4)],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 5))],
        ),
        child: Stack(
          children: [
            // Logo UNE canto superior esquerdo
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.language, color: const Color(0xFF5EBFAE), size: 20),
              ),
            ),
            
            // Logo dne canto superior esquerdo
            Positioned(
              top: 12,
              left: 50,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('dne', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w200, color: Colors.white, height: 0.9)),
                  Text('Documento Nacional', style: TextStyle(fontSize: 6, color: Colors.white, height: 1)),
                  Text('do Estudante', style: TextStyle(fontSize: 6, color: Colors.white, height: 1)),
                ],
              ),
            ),
            
            // Microletras label
            Positioned(
              top: 60,
              left: 16,
              child: Text('Microletras', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600)),
            ),
            
            // QR Code com label
            Positioned(
              top: 75,
              left: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('QR Code', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const LoadingScreen())),
                    child: Container(
                      width: 70,
                      height: 70,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: QrImageView(data: 'https://loading-infinite.app', size: 70),
                    ),
                  ),
                ],
              ),
            ),
            
            // Logos e ANPG canto superior direito
            Positioned(
              top: 60,
              right: 12,
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.public, color: const Color(0xFF5EBFAE), size: 16),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.school, color: const Color(0xFF5EBFAE), size: 16),
                  ),
                  const SizedBox(width: 6),
                  Text('ANPG', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
            ),
            
            // Informações de validade
            Positioned(
              top: 85,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('VALIDADE PARA MEIA-ENTRADA', style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.2)),
                  Text('LEI 12.933 DE 13/25/2013', style: TextStyle(fontSize: 6, color: Colors.black87, height: 1.1)),
                  Text('DECRETO 8.537 DE 05/10/2015', style: TextStyle(fontSize: 6, color: Colors.black87, height: 1.1)),
                  const SizedBox(height: 8),
                  Text('CPF 222.222.222-22', style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.1)),
                  Text('RG 33.333.333-33', style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.1)),
                  Text('DATA DE NASC 01/11/2003', style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.1)),
                  const SizedBox(height: 4),
                  Text('COD. 01/TO8A', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
            ),
            
            // Texto na parte inferior esquerda
            Positioned(
              bottom: 32,
              left: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Serviço de Atendimento ao Estudante', style: TextStyle(fontSize: 6, color: Colors.black54, height: 1)),
                  Text('sae.documentodoestudante.com.br', style: TextStyle(fontSize: 6, color: Colors.black54, height: 1)),
                  const SizedBox(height: 4),
                  Text('Documento para participação parcial ou', style: TextStyle(fontSize: 5, color: Colors.black54, height: 1)),
                  Text('total do direito ao benefício da meia-entrada', style: TextStyle(fontSize: 5, color: Colors.black54, height: 1)),
                  Text('prevista no artigo 1º da Lei 12.933/2013', style: TextStyle(fontSize: 5, color: Colors.black54, height: 1)),
                ],
              ),
            ),
            
            // Código de uso com label
            Positioned(
              bottom: 42,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Código', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                  Text('de uso', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                  const SizedBox(height: 2),
                  Text('COD. 01/TO8A', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
            ),
            
            // Selo de validade
            Positioned(
              bottom: 8,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.black, width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle_outline, size: 12, color: Colors.black),
                    const SizedBox(width: 4),
                    Text('VALIDADE\nMEIA-ENTRADA', style: TextStyle(fontSize: 5, fontWeight: FontWeight.bold, color: Colors.black, height: 1.2)),
                  ],
                ),
              ),
            ),
            
            // Trama de segurança
            Positioned(
              bottom: 28,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Trama de', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                  Text('segurança', style: TextStyle(fontSize: 7, color: Colors.red, fontWeight: FontWeight.w600, height: 1)),
                ],
              ),
            ),
            
            // Ano 2025
            Positioned(
              bottom: 8,
              right: 12,
              child: Text('2025', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w300, color: Color(0xFFE894BC), letterSpacing: 1)),
            ),
          ],
        ),
      ),
    );
  }
}

// ==================== QR CODE PAGE ====================
class QRCodePage extends StatelessWidget {
  const QRCodePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const LoadingScreen())),
        child: Container(
          width: 280,
          height: 280,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
          child: QrImageView(data: 'https://loading-infinite.app', version: QrVersions.auto, size: 280.0),
        ),
      ),
    );
  }
}

// ==================== TELA DE LOADING INFINITO ====================
class LoadingScreen extends StatelessWidget {
  const LoadingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF5EBFAE),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(width: 70, height: 70, child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(Colors.white), strokeWidth: 6)),
            const SizedBox(height: 30),
            Text('Carregando...', style: TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}