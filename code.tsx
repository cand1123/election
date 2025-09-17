import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '/components/ui/card';
import { Button } from '/components/ui/button';
import { Input } from '/components/ui/input';
import { Label } from '/components/ui/label';
import { Textarea } from '/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '/components/ui/avatar';

interface Candidate {
  id: string;
  name: string;
  class: string;
  vision: string;
  mission: string;
  photo: string;
  votes: number;
}

interface User {
  username: string;
  password: string;
  role: 'admin' | 'verifikator' | 'pemilih';
  name: string;
}

interface Voter {
  id: string;
  username: string;
  password: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  isVerified: boolean;
  hasVoted: boolean;
  uniqueId: string;
}

type ViewMode = 'vote' | 'register' | 'results' | 'admin' | 'verifikator' | 'pemilih' | 'kandidat' | 'rekap';
type AuthState = 'login' | 'authenticated';

const ElectionApp = () => {
  // Authentication state
  const [authState, setAuthState] = useState<AuthState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Predefined users
  const users: User[] = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Administrator'
    },
    {
      username: 'verifikator',
      password: 'verif123',
      role: 'verifikator',
      name: 'Verifikator Pemilu'
    },
    {
      username: 'pemilih',
      password: 'pemilih123',
      role: 'pemilih',
      name: 'Siswa Pemilih'
    }
  ];

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Ahmad Rizki Pratama',
      class: 'XI IPA 1',
      vision: 'Mewujudkan OSIS yang inovatif, kreatif, dan berprestasi untuk kemajuan sekolah',
      mission: 'Meningkatkan kegiatan ekstrakurikuler, memperkuat solidaritas antar siswa, dan menciptakan lingkungan sekolah yang kondusif',
      photo: 'https://placeholder-image-service.onrender.com/image/200x200?prompt=Professional student portrait of young Indonesian male student in school uniform smiling confidently&id=dab7ee24-ff89-4fde-a8a1-1aae42ca0466&customer_id=cus_SO9e71co4XYzn7',
      votes: 0
    },
    {
      id: '2',
      name: 'Siti Nurhaliza Dewi',
      class: 'XI IPS 2',
      vision: 'Membangun OSIS yang transparan, demokratis, dan peduli terhadap aspirasi seluruh siswa',
      mission: 'Mengoptimalkan program kerja OSIS, meningkatkan fasilitas siswa, dan memperkuat hubungan dengan alumni',
      photo: 'https://placeholder-image-service.onrender.com/image/200x200?prompt=Professional student portrait of young Indonesian female student in school uniform smiling warmly with hijab&id=dab7ee24-ff89-4fde-a8a1-1aae42ca0466&customer_id=cus_SO9e71co4XYzn7',
      votes: 0
    }
  ]);

  const [currentView, setCurrentView] = useState<ViewMode>('vote');
  const [hasVoted, setHasVoted] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [voterClass, setVoterClass] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isElectionActive, setIsElectionActive] = useState(true);
  const [verifiedVoters, setVerifiedVoters] = useState<Voter[]>([
    { 
      id: '1', 
      username: 'andi_pratama', 
      password: 'andi123', 
      nisn: '1234567890', 
      fullName: 'Andi Pratama', 
      birthPlace: 'Jakarta', 
      birthDate: '2006-05-15', 
      isVerified: true, 
      hasVoted: true,
      uniqueId: '123456789012345'
    },
    { 
      id: '2', 
      username: 'sari_dewi', 
      password: 'sari123', 
      nisn: '1234567891', 
      fullName: 'Sari Dewi', 
      birthPlace: 'Bandung', 
      birthDate: '2006-03-20', 
      isVerified: false, 
      hasVoted: false,
      uniqueId: '234567890123456'
    },
    { 
      id: '3', 
      username: 'budi_santoso', 
      password: 'budi123', 
      nisn: '1234567892', 
      fullName: 'Budi Santoso', 
      birthPlace: 'Surabaya', 
      birthDate: '2005-12-10', 
      isVerified: true, 
      hasVoted: true,
      uniqueId: '345678901234567'
    }
  ]);
  const [newVoter, setNewVoter] = useState({
    username: '',
    password: '',
    nisn: '',
    fullName: '',
    birthPlace: '',
    birthDate: ''
  });
  const [currentVoterId, setCurrentVoterId] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVoterForQR, setSelectedVoterForQR] = useState<Voter | null>(null);
  const [showQRLogin, setShowQRLogin] = useState(false);
  const [scannedQRData, setScannedQRData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // New candidate form
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    class: '',
    vision: '',
    mission: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCandidates = localStorage.getItem('osis-candidates');
    const savedVoteStatus = localStorage.getItem('osis-has-voted');
    const savedElectionStatus = localStorage.getItem('osis-election-active');
    const savedUser = localStorage.getItem('osis-current-user');
    
    if (savedCandidates) {
      setCandidates(JSON.parse(savedCandidates));
    }
    
    if (savedVoteStatus) {
      setHasVoted(JSON.parse(savedVoteStatus));
    }
    
    if (savedElectionStatus) {
      setIsElectionActive(JSON.parse(savedElectionStatus));
    }

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setAuthState('authenticated');
    }

    const savedVerifiedVoters = localStorage.getItem('osis-verified-voters');
    const savedCurrentVoterId = localStorage.getItem('osis-current-voter-id');
    
    if (savedVerifiedVoters) {
      setVerifiedVoters(JSON.parse(savedVerifiedVoters));
    }
    
    if (savedCurrentVoterId) {
      setCurrentVoterId(savedCurrentVoterId);
    }
  }, []);

  // Save candidates to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('osis-candidates', JSON.stringify(candidates));
  }, [candidates]);

  // Save verified voters to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('osis-verified-voters', JSON.stringify(verifiedVoters));
  }, [verifiedVoters]);

  const handleVote = () => {
    if (!voterName.trim() || !voterClass.trim() || !selectedCandidate) {
      alert('Mohon lengkapi semua data dan pilih kandidat!');
      return;
    }

    // Check if voter is verified
    const voter = verifiedVoters.find(v => 
      v.fullName.toLowerCase() === voterName.toLowerCase()
    );

    if (!voter) {
      alert('Data pemilih tidak ditemukan! Silakan hubungi verifikator untuk mendaftar.');
      return;
    }

    if (!voter.isVerified) {
      alert('Anda belum terverifikasi! Silakan hubungi verifikator untuk verifikasi.');
      return;
    }

    if (voter.hasVoted) {
      alert('Anda sudah memberikan suara!');
      return;
    }

    // Update vote count
    setCandidates(prev => prev.map(candidate => 
      candidate.id === selectedCandidate 
        ? { ...candidate, votes: candidate.votes + 1 }
        : candidate
    ));

    // Mark voter as voted
    setVerifiedVoters(prev => prev.map(v => 
      v.id === voter.id ? { ...v, hasVoted: true } : v
    ));

    // Mark as voted
    setHasVoted(true);
    setCurrentVoterId(voter.id);
    localStorage.setItem('osis-has-voted', 'true');
    localStorage.setItem('osis-current-voter-id', voter.id);
    
    alert('Terima kasih! Suara Anda telah tercatat.');
    setCurrentView('results');
  };

  const handleRegisterCandidate = () => {
    if (!newCandidate.name.trim() || !newCandidate.class.trim() || 
        !newCandidate.vision.trim() || !newCandidate.mission.trim()) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    const candidate: Candidate = {
      id: Date.now().toString(),
      name: newCandidate.name,
      class: newCandidate.class,
      vision: newCandidate.vision,
      mission: newCandidate.mission,
      photo: `https://placeholder-image-service.onrender.com/image/200x200?prompt=Professional student portrait of Indonesian student in school uniform smiling confidently representing leadership qualities&id=dab7ee24-ff89-4fde-a8a1-1aae42ca0466&customer_id=cus_SO9e71co4XYzn7`,
      votes: 0
    };

    setCandidates(prev => [...prev, candidate]);
    setNewCandidate({ name: '', class: '', vision: '', mission: '' });
    alert('Kandidat berhasil didaftarkan!');
    setCurrentView('vote');
  };

  const resetElection = () => {
    if (confirm('Yakin ingin mereset pemilihan? Semua data akan dihapus.')) {
      setCandidates(prev => prev.map(candidate => ({ ...candidate, votes: 0 })));
      setHasVoted(false);
      localStorage.removeItem('osis-has-voted');
      alert('Pemilihan telah direset!');
    }
  };

  const toggleElection = () => {
    const newStatus = !isElectionActive;
    setIsElectionActive(newStatus);
    localStorage.setItem('osis-election-active', JSON.stringify(newStatus));
    alert(newStatus ? 'Pemilihan diaktifkan!' : 'Pemilihan ditutup!');
  };

  const handleLogin = () => {
    const user = users.find(u => 
      u.username === loginForm.username && u.password === loginForm.password
    );

    if (user) {
      setCurrentUser(user);
      setAuthState('authenticated');
      localStorage.setItem('osis-current-user', JSON.stringify(user));
      
      // Set initial view based on role
      if (user.role === 'admin') {
        setCurrentView('admin');
      } else if (user.role === 'verifikator') {
        setCurrentView('verifikator');
      } else {
        setCurrentView('vote');
      }
    } else {
      alert('Username atau password salah!');
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      
      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setStream(mediaStream);
      
      setTimeout(() => {
        const video = document.getElementById('qr-scanner-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = mediaStream;
          video.play();
          
          // Try ZXing library if available
          if (typeof (window as any).ZXing !== 'undefined') {
            try {
              const codeReader = new (window as any).ZXing.BrowserQRCodeReader();
              
              codeReader.decodeFromVideoDevice(null, 'qr-scanner-video', (result: any, error: any) => {
                if (result) {
                  console.log('QR Code detected:', result.text);
                  setScannedQRData(result.text);
                  stopCamera();
                  alert('QR Code berhasil dibaca!');
                }
                if (error && error.name !== 'NotFoundException') {
                  console.log('QR scanning error:', error);
                }
              });
              
              alert('Kamera aktif! Arahkan ke QR Code untuk scanning otomatis.');
            } catch (error) {
              console.log('ZXing initialization error:', error);
              // Fallback to simulation
              simulateQRScan(video);
            }
          } else {
            // ZXing not available, use simulation
            simulateQRScan(video);
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera error:', error);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan atau masukkan data QR secara manual.');
      setIsScanning(false);
    }
  };

  const simulateQRScan = (video: HTMLVideoElement) => {
    const scanQRCode = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          console.log('Scanning for QR code...');
        }
      }
      
      if (isScanning) {
        requestAnimationFrame(scanQRCode);
      }
    };
    
    video.addEventListener('loadeddata', () => {
      scanQRCode();
      // Auto-demo after 3 seconds for testing
      setTimeout(() => {
        if (isScanning) {
          const demoQR = 'TOKEN_ID: TOKENABC123XYZ9876\nNISN: 1234567892\nNama: Budi Santoso\nUsername: budi_santoso\nTempat Lahir: Surabaya\nTanggal Lahir: 2005-12-10';
          setScannedQRData(demoQR);
          stopCamera();
          alert('QR Code berhasil dibaca! (Demo Auto-Scan)');
        }
      }, 3000);
    });
    
    alert('Kamera aktif! ZXing tidak tersedia, menggunakan simulasi. Demo akan auto-scan setelah 3 detik.');
  };

  const stopCamera = () => {
    // Stop ZXing reader if exists
    if (typeof (window as any).ZXing !== 'undefined') {
      try {
        const codeReader = new (window as any).ZXing.BrowserQRCodeReader();
        codeReader.reset();
      } catch (error) {
        console.log('Error stopping ZXing reader:', error);
      }
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleQRLogin = () => {
    if (!scannedQRData.trim()) {
      alert('Mohon masukkan data QR Code!');
      return;
    }

    console.log('QR Data received:', scannedQRData);

    // First check for unique ID
    const uniqueIdMatch = scannedQRData.match(/UNIQUE_ID:\s*([0-9]{15})/i);
    if (!uniqueIdMatch) {
      alert('QR Code tidak valid! Unique ID tidak ditemukan.');
      return;
    }

    const uniqueId = uniqueIdMatch[1];
    console.log('Unique ID found:', uniqueId);
    console.log('Available voters:', verifiedVoters.map(v => ({ uniqueId: v.uniqueId, name: v.fullName, verified: v.isVerified })));
    
    const voter = verifiedVoters.find(v => v.uniqueId === uniqueId);

    if (!voter) {
      alert(`Pemilih dengan NISN ${nisn} tidak ditemukan! Silakan hubungi verifikator.`);
      return;
    }

    if (!voter.isVerified) {
      alert(`${voter.fullName} belum terverifikasi! Silakan hubungi verifikator untuk verifikasi.`);
      return;
    }

    if (voter.hasVoted) {
      alert(`${voter.fullName} sudah memberikan suara sebelumnya!`);
      return;
    }

    // Create temporary user for QR login
    const qrUser: User = {
      username: voter.username,
      password: voter.password,
      role: 'pemilih',
      name: voter.fullName
    };

    setCurrentUser(qrUser);
    setAuthState('authenticated');
    setShowQRLogin(false);
    setScannedQRData('');
    stopCamera();
    
    // Pre-fill voter data for voting
    setVoterName(voter.fullName);
    
    // Show profile modal first, then redirect
    setShowProfileModal(true);
    setTimeout(() => {
      setShowProfileModal(false);
      setCurrentView('vote');
    }, 3000);
    
    alert(`Login berhasil! Unique ID: ${uniqueId} telah diverifikasi.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthState('login');
    setLoginForm({ username: '', password: '' });
    localStorage.removeItem('osis-current-user');
  };

  const generateQRCodeURL = (voter: Voter) => {
    // Use static unique ID for consistent QR codes
    const qrData = `UNIQUE_ID: ${voter.uniqueId}\nNISN: ${voter.nisn}\nNama: ${voter.fullName}\nUsername: ${voter.username}\nTempat Lahir: ${voter.birthPlace}\nTanggal Lahir: ${voter.birthDate}`;
    const encodedData = encodeURIComponent(qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
  };

  const handlePrintQR = () => {
    if (!selectedVoterForQR) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const qrURL = generateQRCodeURL(selectedVoterForQR);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${selectedVoterForQR.fullName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              border: 1px solid #ccc;
              padding: 20px;
              display: inline-block;
              margin: 20px;
            }
            .voter-info {
              margin-top: 15px;
              text-align: left;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>QR Code Pemilih</h2>
            <img src="${qrURL}" alt="QR Code" style="border: 1px solid #ddd;" />
            <div class="voter-info">
              <p><strong>Nama:</strong> ${selectedVoterForQR.fullName}</p>
              <p><strong>NISN:</strong> ${selectedVoterForQR.nisn}</p>
              <p><strong>Username:</strong> ${selectedVoterForQR.username}</p>
              <p><strong>Tempat Lahir:</strong> ${selectedVoterForQR.birthPlace}</p>
              <p><strong>Tanggal Lahir:</strong> ${new Date(selectedVoterForQR.birthDate).toLocaleDateString('id-ID')}</p>
              <p><strong>Status:</strong> ${selectedVoterForQR.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}</p>
            </div>
          </div>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print QR Code</button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateQRPDF = async (voter: Voter) => {
    const qrURL = generateQRCodeURL(voter);
    
    // Create a canvas to generate PDF content
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 595; // A4 width in points
    canvas.height = 842; // A4 height in points

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw header
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SISTEM PEMILU OSIS', canvas.width / 2, 80);
    
    ctx.font = 'bold 18px Arial';
    ctx.fillText('QR Code Pemilih', canvas.width / 2, 110);

    // Draw border around content
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Load and draw QR code image
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw QR code centered
        const qrSize = 200;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 150;
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Draw voter information
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        let yPos = qrY + qrSize + 40;
        const leftMargin = 100;

        ctx.fillText(`Nama Lengkap: ${voter.fullName}`, leftMargin, yPos);
        yPos += 25;
        ctx.fillText(`NISN: ${voter.nisn}`, leftMargin, yPos);
        yPos += 25;
        ctx.fillText(`Username: ${voter.username}`, leftMargin, yPos);
        yPos += 25;
        ctx.fillText(`Tempat Lahir: ${voter.birthPlace}`, leftMargin, yPos);
        yPos += 25;
        ctx.fillText(`Tanggal Lahir: ${new Date(voter.birthDate).toLocaleDateString('id-ID')}`, leftMargin, yPos);
        yPos += 40;

        // Status
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = voter.isVerified ? '#16a34a' : '#dc2626';
        ctx.fillText(`Status: ${voter.isVerified ? 'TERVERIFIKASI' : 'BELUM VERIFIKASI'}`, canvas.width / 2, yPos);

        // Footer
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        yPos += 50;
        ctx.fillText('Scan QR Code ini untuk login ke sistem pemilu OSIS', canvas.width / 2, yPos);
        yPos += 20;
        ctx.fillText(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, canvas.width / 2, yPos);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = qrURL;
    });
  };

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  const winner = candidates.reduce((prev, current) => 
    current.votes > prev.votes ? current : prev
  );

  const renderVotingInterface = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Pemilihan Ketua OSIS
        </h1>
        <p className="text-muted-foreground">
          Pilih kandidat terbaik untuk memimpin OSIS periode mendatang
        </p>
        {!isElectionActive && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg mt-4">
            Pemilihan sedang ditutup
          </div>
        )}
      </div>

      {isElectionActive && !hasVoted && currentUser?.role === 'pemilih' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Pemilih</CardTitle>
            <CardDescription>Masukkan data diri Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="voter-name">Nama Lengkap</Label>
              <Input
                id="voter-name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <Label htmlFor="voter-class">Kelas</Label>
              <Input
                id="voter-class"
                value={voterClass}
                onChange={(e) => setVoterClass(e.target.value)}
                placeholder="Contoh: XI IPA 1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCandidate === candidate.id ? 'ring-2 ring-primary' : ''
            } ${!isElectionActive || hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (isElectionActive && !hasVoted) {
                setSelectedCandidate(candidate.id);
              }
            }}
          >
            <CardHeader className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{candidate.name}</CardTitle>
              <CardDescription className="text-lg font-medium">
                {candidate.class}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Visi:</h4>
                <p className="text-sm text-muted-foreground">{candidate.vision}</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Misi:</h4>
                <p className="text-sm text-muted-foreground">{candidate.mission}</p>
              </div>
              {selectedCandidate === candidate.id && (
                <div className="bg-primary/10 text-primary p-3 rounded-lg text-center font-medium">
                  Kandidat Terpilih
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isElectionActive && !hasVoted && (
        <div className="text-center mt-8">
          <Button 
            onClick={handleVote} 
            size="lg" 
            className="px-8"
            disabled={!selectedCandidate || !voterName.trim() || !voterClass.trim()}
          >
            Konfirmasi Pilihan
          </Button>
        </div>
      )}

      {(hasVoted || currentUser?.role !== 'pemilih') && totalVotes > 0 && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
          <h3 className="font-semibold">Terima Kasih!</h3>
          <p>Suara Anda telah tercatat dalam sistem.</p>
        </div>
      )}
    </div>
  );

  const renderCandidateRegistration = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Daftarkan Kandidat Baru</CardTitle>
          <CardDescription>
            Masukkan informasi lengkap calon kandidat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="candidate-name">Nama Lengkap</Label>
            <Input
              id="candidate-name"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
              placeholder="Nama lengkap kandidat"
            />
          </div>
          <div>
            <Label htmlFor="candidate-class">Kelas</Label>
            <Input
              id="candidate-class"
              value={newCandidate.class}
              onChange={(e) => setNewCandidate({...newCandidate, class: e.target.value})}
              placeholder="Contoh: XI IPA 1"
            />
          </div>
          <div>
            <Label htmlFor="candidate-vision">Visi</Label>
            <Textarea
              id="candidate-vision"
              value={newCandidate.vision}
              onChange={(e) => setNewCandidate({...newCandidate, vision: e.target.value})}
              placeholder="Visi kandidat untuk OSIS"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="candidate-mission">Misi</Label>
            <Textarea
              id="candidate-mission"
              value={newCandidate.mission}
              onChange={(e) => setNewCandidate({...newCandidate, mission: e.target.value})}
              placeholder="Misi dan program kerja kandidat"
              rows={4}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleRegisterCandidate} className="flex-1">
              Daftarkan Kandidat
            </Button>
            <Button variant="outline" onClick={() => setCurrentView('vote')}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLoginPage = () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Login Sistem Pemilu OSIS
          </CardTitle>
          <CardDescription>
            Masuk sesuai dengan peran Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load ZXing library */}
          <script src="https://unpkg.com/@zxing/library@latest" async></script>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              placeholder="Masukkan password"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Masuk
          </Button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">atau</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Button 
            onClick={() => setShowQRLogin(true)} 
            variant="outline" 
            className="w-full"
          >
            Login dengan QR Code
          </Button>

          {/* QR Scanner Section */}
          {showQRLogin && (
            <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-2">Login dengan QR Code</h4>
              </div>
              
              {/* Camera Scanner */}
              {isScanning && (
                <div className="space-y-3">
                  <div className="text-center">
                    <video
                      id="qr-scanner-video"
                      className="w-full max-w-xs mx-auto border rounded-lg bg-black"
                      autoPlay
                      playsInline
                      muted
                      style={{ maxHeight: '250px' }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Arahkan kamera ke QR Code
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={stopCamera} variant="outline" size="sm" className="flex-1">
                      Hentikan Scan
                    </Button>
                  </div>
                </div>
              )}

              {/* Scanner Controls */}
              <div className="space-y-3">
                {!isScanning && (
                  <Button 
                    onClick={startCamera}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    📷 Aktifkan Kamera
                  </Button>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground">atau input manual</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                <div>
                  <Label htmlFor="qr-data-login" className="text-xs">Data QR Code</Label>
                  <Textarea
                    id="qr-data-login"
                    value={scannedQRData}
                    onChange={(e) => {
                      console.log('QR data changed:', e.target.value);
                      setScannedQRData(e.target.value);
                    }}
                    placeholder="Format: UNIQUE_ID: 123456789012345\nNISN: 1234567890\nNama: Nama Lengkap"
                    rows={4}
                    className="text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    QR Code harus mengandung UNIQUE_ID 15 digit untuk keamanan
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground p-2 bg-background rounded text-center">
                <p className="font-semibold mb-1">Contoh untuk testing:</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => setScannedQRData('UNIQUE_ID: 345678901234567\nNISN: 1234567892\nNama: Budi Santoso\nUsername: budi_santoso\nTempat Lahir: Surabaya\nTanggal Lahir: 2005-12-10')}
                    className="block text-xs text-green-600 underline hover:text-green-800"
                    type="button"
                  >
                    ✅ QR Budi Santoso (Terverifikasi) - ID: 345678901234567
                  </button>
                  <button 
                    onClick={() => setScannedQRData('UNIQUE_ID: 234567890123456\nNISN: 1234567891\nNama: Sari Dewi\nUsername: sari_dewi\nTempat Lahir: Bandung\nTanggal Lahir: 2006-03-20')}
                    className="block text-xs text-red-600 underline hover:text-red-800"
                  >
                    ❌ QR Sari Dewi (Belum Verifikasi)
                  </button>
                  <button 
                    onClick={() => setScannedQRData('UNIQUE_ID: 123456789012345\nNISN: 1234567890\nNama: Andi Pratama\nUsername: andi_pratama\nTempat Lahir: Jakarta\nTanggal Lahir: 2006-05-15')}
                    className="block text-xs text-orange-600 underline hover:text-orange-800"
                  >
                    ⚠️ QR Andi Pratama (Sudah Memilih)
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    console.log('Login QR button clicked');
                    console.log('QR Data:', scannedQRData);
                    handleQRLogin();
                  }}
                  size="sm"
                  className="flex-1"
                  disabled={!scannedQRData.trim()}
                >
                  Login QR
                </Button>
                <Button 
                  onClick={() => {
                    stopCamera();
                    setShowQRLogin(false);
                    setScannedQRData('');
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Demo Login:</h4>
            <div className="text-xs space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Verifikator:</strong> verifikator / verif123</p>
              <p><strong>Pemilih:</strong> pemilih / pemilih123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPemilihPanel = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kelola Pemilih</CardTitle>
          <CardDescription>Tambah dan verifikasi pemilih</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voter-username">Username</Label>
              <Input
                id="voter-username"
                value={newVoter.username}
                onChange={(e) => setNewVoter({...newVoter, username: e.target.value})}
                placeholder="Username untuk login"
              />
            </div>
            <div>
              <Label htmlFor="voter-password">Password</Label>
              <Input
                id="voter-password"
                type="password"
                value={newVoter.password}
                onChange={(e) => setNewVoter({...newVoter, password: e.target.value})}
                placeholder="Password untuk login"
              />
            </div>
            <div>
              <Label htmlFor="voter-nisn">NISN</Label>
              <Input
                id="voter-nisn"
                value={newVoter.nisn}
                onChange={(e) => setNewVoter({...newVoter, nisn: e.target.value})}
                placeholder="Nomor Induk Siswa Nasional"
              />
            </div>
            <div>
              <Label htmlFor="voter-fullname">Nama Lengkap</Label>
              <Input
                id="voter-fullname"
                value={newVoter.fullName}
                onChange={(e) => setNewVoter({...newVoter, fullName: e.target.value})}
                placeholder="Nama lengkap siswa"
              />
            </div>
            <div>
              <Label htmlFor="voter-birthplace">Tempat Lahir</Label>
              <Input
                id="voter-birthplace"
                value={newVoter.birthPlace}
                onChange={(e) => setNewVoter({...newVoter, birthPlace: e.target.value})}
                placeholder="Tempat lahir"
              />
            </div>
            <div>
              <Label htmlFor="voter-birthdate">Tanggal Lahir</Label>
              <Input
                id="voter-birthdate"
                type="date"
                value={newVoter.birthDate}
                onChange={(e) => setNewVoter({...newVoter, birthDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                if (!newVoter.username.trim() || !newVoter.password.trim() || !newVoter.nisn.trim() || 
                    !newVoter.fullName.trim() || !newVoter.birthPlace.trim() || !newVoter.birthDate.trim()) {
                  alert('Mohon lengkapi semua data pemilih!');
                  return;
                }
                
                // Check if voter already exists
                const existingVoter = verifiedVoters.find(v => 
                  v.username.toLowerCase() === newVoter.username.toLowerCase() || 
                  v.nisn === newVoter.nisn
                );
                
                if (existingVoter) {
                  alert('Pemilih dengan username atau NISN tersebut sudah terdaftar!');
                  return;
                }
                
                // Generate unique 15-digit ID
                const uniqueId = Math.random().toString().substring(2, 17).padStart(15, '0');
                
                // Add new voter
                const voter: Voter = {
                  id: Date.now().toString(),
                  username: newVoter.username,
                  password: newVoter.password,
                  nisn: newVoter.nisn,
                  fullName: newVoter.fullName,
                  birthPlace: newVoter.birthPlace,
                  birthDate: newVoter.birthDate,
                  isVerified: false,
                  hasVoted: false,
                  uniqueId: uniqueId
                };
                
                setVerifiedVoters(prev => [...prev, voter]);
                alert(`Pemilih ${newVoter.fullName} berhasil ditambahkan!`);
                setNewVoter({
                  username: '',
                  password: '',
                  nisn: '',
                  fullName: '',
                  birthPlace: '',
                  birthDate: ''
                });
              }}
              disabled={!newVoter.username.trim() || !newVoter.password.trim() || !newVoter.nisn.trim() || 
                       !newVoter.fullName.trim() || !newVoter.birthPlace.trim() || !newVoter.birthDate.trim()}
            >
              Tambah Pemilih
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewVoter({
                  username: '',
                  password: '',
                  nisn: '',
                  fullName: '',
                  birthPlace: '',
                  birthDate: ''
                });
              }}
            >
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voter List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pemilih Terdaftar</CardTitle>
          <CardDescription>Siswa yang berhak memilih dalam pemilu OSIS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verifiedVoters.map((voter) => (
              <div key={voter.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{voter.fullName}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                      <p><strong>Username:</strong> {voter.username}</p>
                      <p><strong>NISN:</strong> {voter.nisn}</p>
                      <p><strong>Tempat Lahir:</strong> {voter.birthPlace}</p>
                      <p><strong>Tanggal Lahir:</strong> {new Date(voter.birthDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <img 
                      src={generateQRCodeURL(voter)}
                      alt="QR code for student voter containing NISN and personal information for election login"
                      className="mb-2 mx-auto border rounded w-20 h-20"
                    />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {voter.uniqueId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {!voter.isVerified ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Belum Verifikasi</span>
                    ) : voter.hasVoted ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Sudah Memilih</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Belum Memilih</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!voter.isVerified && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setVerifiedVoters(prev => prev.map(v => 
                            v.id === voter.id ? { ...v, isVerified: true } : v
                          ));
                          alert(`${voter.fullName} berhasil diverifikasi!`);
                        }}
                      >
                        Verifikasi
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedVoterForQR(voter);
                        setShowQRModal(true);
                      }}
                    >
                      Generate QR
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderKandidatPanel = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kelola Kandidat</CardTitle>
          <CardDescription>Monitoring dan kelola kandidat OSIS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.class}</p>
                    <p className="text-xs text-muted-foreground mt-1">{candidate.vision}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-primary">{candidate.votes} suara</div>
                    <div className="text-sm text-muted-foreground">
                      {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                    </div>
                  </div>
                  <Button
                    variant={candidate.id === winner.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (confirm(`Yakin ingin menetapkan ${candidate.name} sebagai pemenang?`)) {
                        alert(`${candidate.name} telah ditetapkan sebagai Ketua OSIS terpilih!`);
                      }
                    }}
                  >
                    {candidate.id === winner.id ? 'Pemenang Saat Ini' : 'Pilih Sebagai Pemenang'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Candidate Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Kandidat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-2">
                    <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{candidate.name}</CardTitle>
                  <CardDescription>{candidate.class}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-semibold text-sm">Visi:</h5>
                    <p className="text-xs text-muted-foreground">{candidate.vision}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">Misi:</h5>
                    <p className="text-xs text-muted-foreground">{candidate.mission}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Total Suara:</span>
                      <span className="font-bold text-primary">{candidate.votes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRekapPanel = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rekap Pemilih</CardTitle>
          <CardDescription>Ringkasan data pemilih dan voting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">120</div>
                <div className="text-sm text-muted-foreground">Total Siswa</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalVotes}</div>
                <div className="text-sm text-muted-foreground">Sudah Memilih</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{120 - totalVotes}</div>
                <div className="text-sm text-muted-foreground">Belum Memilih</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {totalVotes > 0 ? Math.round((totalVotes / 120) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Partisipasi</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Pemilihan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Partisipasi Pemilih</span>
                  <span>{totalVotes > 0 ? Math.round((totalVotes / 120) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full transition-all"
                    style={{ width: `${totalVotes > 0 ? (totalVotes / 120) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Suara per Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">XI IPA</h4>
                    <div className="text-2xl font-bold text-primary">{Math.floor(totalVotes * 0.4)}</div>
                    <div className="text-sm text-muted-foreground">pemilih</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">XI IPS</h4>
                    <div className="text-2xl font-bold text-primary">{Math.floor(totalVotes * 0.35)}</div>
                    <div className="text-sm text-muted-foreground">pemilih</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">XII</h4>
                    <div className="text-2xl font-bold text-primary">{Math.floor(totalVotes * 0.25)}</div>
                    <div className="text-sm text-muted-foreground">pemilih</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline Pemilihan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-sm">Pemilihan Dibuka</div>
                    <div className="text-xs text-muted-foreground">08:00 WIB - Hari ini</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-sm">Pemilihan Berlangsung</div>
                    <div className="text-xs text-muted-foreground">Saat ini - {totalVotes} suara masuk</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-sm">Penutupan Pemilihan</div>
                    <div className="text-xs text-muted-foreground">17:00 WIB - Hari ini</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderVerifikatorPanel = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel Verifikator</CardTitle>
          <CardDescription>
            Verifikasi dan monitoring pemilihan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
                <div className="text-sm text-muted-foreground">Total Kandidat</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalVotes}</div>
                <div className="text-sm text-muted-foreground">Total Suara</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {isElectionActive ? 'Aktif' : 'Nonaktif'}
                </div>
                <div className="text-sm text-muted-foreground">Status Pemilihan</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Add Voter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Pemilih</CardTitle>
          <CardDescription>Verifikasi dan tambahkan pemilih baru</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-voter-name">Nama Pemilih</Label>
              <Input
                id="new-voter-name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="Nama lengkap pemilih"
              />
            </div>
            <div>
              <Label htmlFor="new-voter-class">Kelas Pemilih</Label>
              <Input
                id="new-voter-class"
                value={voterClass}
                onChange={(e) => setVoterClass(e.target.value)}
                placeholder="Contoh: XI IPA 1"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                if (!voterName.trim() || !voterClass.trim()) {
                  alert('Mohon lengkapi data pemilih!');
                  return;
                }
                alert(`Pemilih ${voterName} dari kelas ${voterClass} berhasil ditambahkan!`);
                setVoterName('');
                setVoterClass('');
              }}
              disabled={!voterName.trim() || !voterClass.trim()}
            >
              Tambah Pemilih
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setVoterName('');
                setVoterClass('');
              }}
            >
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Select Winner Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tentukan Kandidat Terpilih</CardTitle>
          <CardDescription>Pilih kandidat yang menjadi pemenang resmi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-primary">{candidate.votes} suara</div>
                    <div className="text-sm text-muted-foreground">
                      {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                    </div>
                  </div>
                  <Button
                    variant={candidate.id === winner.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (confirm(`Yakin ingin menetapkan ${candidate.name} sebagai pemenang?`)) {
                        alert(`${candidate.name} telah ditetapkan sebagai Ketua OSIS terpilih!`);
                      }
                    }}
                  >
                    {candidate.id === winner.id ? 'Pemenang Saat Ini' : 'Pilih Sebagai Pemenang'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Section */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Kandidat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{candidate.votes} suara</div>
                  <div className="text-sm text-muted-foreground">
                    {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Hasil Pemilihan
        </h1>
        <p className="text-muted-foreground">
          Total suara yang masuk: {totalVotes} suara
        </p>
      </div>

      {totalVotes > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              🏆 Pemenang Sementara
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={winner.photo} alt={`Photo of ${winner.name}`} />
              <AvatarFallback>{winner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{winner.name}</h3>
            <p className="text-muted-foreground">{winner.class}</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {winner.votes} suara ({totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates
          .sort((a, b) => b.votes - a.votes)
          .map((candidate, index) => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                  <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{candidate.name}</CardTitle>
                  <CardDescription>{candidate.class}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {candidate.votes}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ 
                    width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel Administrator</CardTitle>
          <CardDescription>
            Kelola pemilihan dan kandidat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={toggleElection}
              variant={isElectionActive ? "destructive" : "default"}
            >
              {isElectionActive ? 'Tutup Pemilihan' : 'Buka Pemilihan'}
            </Button>
            <Button onClick={resetElection} variant="outline">
              Reset Pemilihan
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
                <div className="text-sm text-muted-foreground">Total Kandidat</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalVotes}</div>
                <div className="text-sm text-muted-foreground">Total Suara</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {isElectionActive ? 'Aktif' : 'Nonaktif'}
                </div>
                <div className="text-sm text-muted-foreground">Status Pemilihan</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kandidat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={candidate.photo} alt={`Photo of ${candidate.name}`} />
                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{candidate.votes} suara</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (authState === 'login') {
    return renderLoginPage();
  }

  const getAvailableViews = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case 'admin':
        return ['vote', 'register', 'results', 'admin'];
      case 'verifikator':
        return ['results', 'verifikator', 'pemilih', 'kandidat', 'rekap'];
      case 'pemilih':
        return ['vote', 'results'];
      default:
        return ['vote'];
    }
  };

  const availableViews = getAvailableViews();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Selamat datang, {currentUser?.name}</h2>
            <p className="text-sm text-muted-foreground">Role: {currentUser?.role}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {availableViews.includes('vote') && (
            <Button 
              variant={currentView === 'vote' ? 'default' : 'outline'}
              onClick={() => setCurrentView('vote')}
            >
              Pemilihan
            </Button>
          )}
          {availableViews.includes('register') && (
            <Button 
              variant={currentView === 'register' ? 'default' : 'outline'}
              onClick={() => setCurrentView('register')}
            >
              Daftar Kandidat
            </Button>
          )}
          {availableViews.includes('results') && (
            <Button 
              variant={currentView === 'results' ? 'default' : 'outline'}
              onClick={() => setCurrentView('results')}
            >
              Hasil
            </Button>
          )}
          {availableViews.includes('admin') && (
            <Button 
              variant={currentView === 'admin' ? 'default' : 'outline'}
              onClick={() => setCurrentView('admin')}
            >
              Admin
            </Button>
          )}
          {availableViews.includes('verifikator') && (
            <Button 
              variant={currentView === 'verifikator' ? 'default' : 'outline'}
              onClick={() => setCurrentView('verifikator')}
            >
              Dashboard
            </Button>
          )}
          {availableViews.includes('pemilih') && (
            <Button 
              variant={currentView === 'pemilih' ? 'default' : 'outline'}
              onClick={() => setCurrentView('pemilih')}
            >
              Pemilih
            </Button>
          )}
          {availableViews.includes('kandidat') && (
            <Button 
              variant={currentView === 'kandidat' ? 'default' : 'outline'}
              onClick={() => setCurrentView('kandidat')}
            >
              Kandidat
            </Button>
          )}
          {availableViews.includes('rekap') && (
            <Button 
              variant={currentView === 'rekap' ? 'default' : 'outline'}
              onClick={() => setCurrentView('rekap')}
            >
              Rekap Pemilih
            </Button>
          )}
        </div>

        {/* Content */}
        {currentView === 'vote' && renderVotingInterface()}
        {currentView === 'register' && renderCandidateRegistration()}
        {currentView === 'results' && renderResults()}
        {currentView === 'admin' && renderAdmin()}
        {currentView === 'verifikator' && renderVerifikatorPanel()}
        {currentView === 'pemilih' && renderPemilihPanel()}
        {currentView === 'kandidat' && renderKandidatPanel()}
        {currentView === 'rekap' && renderRekapPanel()}
      </div>

      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-green-600">Login Berhasil!</CardTitle>
              <CardDescription>
                Selamat datang di Sistem Pemilu OSIS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-bold">{currentUser.name}</h3>
                <p className="text-sm text-muted-foreground">Role: {currentUser.role}</p>
              </div>
              
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-semibold mb-2">Informasi Login:</p>
                <p>• Username: {currentUser.username}</p>
                <p>• Waktu Login: {new Date().toLocaleString('id-ID')}</p>
                <p>• Status: Terverifikasi ✓</p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Anda akan diarahkan ke halaman pemilihan dalam 3 detik...
                </p>
                <div className="mt-2">
                  <Button 
                    onClick={() => {
                      setShowProfileModal(false);
                      setCurrentView('vote');
                    }}
                    size="sm"
                  >
                    Lanjutkan Sekarang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedVoterForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">QR Code Pemilih</CardTitle>
              <CardDescription className="text-center">
                {selectedVoterForQR.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <img 
                  src={generateQRCodeURL(selectedVoterForQR)}
                  alt="Large QR code containing complete voter information for election authentication and login"
                  className="mx-auto border rounded-lg"
                  id="modal-qr-image"
                />
              </div>
              
              <div className="text-sm space-y-2 bg-muted p-3 rounded-lg">
                <p><strong>NISN:</strong> {selectedVoterForQR.nisn}</p>
                <p><strong>Nama:</strong> {selectedVoterForQR.fullName}</p>
                <p><strong>Username:</strong> {selectedVoterForQR.username}</p>
                <p><strong>Tempat Lahir:</strong> {selectedVoterForQR.birthPlace}</p>
                <p><strong>Tanggal Lahir:</strong> {new Date(selectedVoterForQR.birthDate).toLocaleDateString('id-ID')}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedVoterForQR.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedVoterForQR.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                  </span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    const qrData = `NISN: ${selectedVoterForQR.nisn}\nNama: ${selectedVoterForQR.fullName}\nUsername: ${selectedVoterForQR.username}\nTempat Lahir: ${selectedVoterForQR.birthPlace}\nTanggal Lahir: ${selectedVoterForQR.birthDate}`;
                    navigator.clipboard.writeText(qrData).then(() => {
                      alert('Data QR Code berhasil disalin!');
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Copy Data
                </Button>
                <Button 
                  onClick={handlePrintQR}
                  className="flex-1"
                >
                  Print QR
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={async () => {
                    try {
                      const pdfDataURL = await generateQRPDF(selectedVoterForQR);
                      if (pdfDataURL) {
                        const link = document.createElement('a');
                        link.download = `qr-${selectedVoterForQR.fullName.replace(/\s+/g, '-')}.png`;
                        link.href = pdfDataURL;
                        link.click();
                      }
                    } catch (error) {
                      alert('Gagal mengunduh QR Code. Silakan coba lagi.');
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Download QR PDF
                </Button>
                <Button 
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedVoterForQR(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ElectionApp;
