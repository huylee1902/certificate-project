// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {

    // ==========================================
    // STRUCTS
    // ==========================================

    struct School {
        string  schoolName;     // Tên trường: "Đại học Bách Khoa HN"
        string  schoolCode;     // Mã trường: "HUST"
        bool    isAuthorized;   // Đang được phép hoạt động không
        uint256 authorizedAt;   // Thời điểm được cấp quyền
        uint256 totalIssued;    // Tổng số bằng trường này đã cấp
    }

    struct Certificate {
        string  certId;         // Mã văn bằng: "HUST-2024-0001"
        string  studentName;    // Tên sinh viên
        string  studentId;      // Mã sinh viên
        string  degreeType;     // Loại bằng: "Giỏi", "Khá"
        string  major;          // Ngành học
        string  ipfsHash;       // CID file PDF trên IPFS
        uint256 issueDate;      // Ngày cấp (unix timestamp)
        address issuedBy;       // Địa chỉ ví trường cấp bằng
        string  schoolName;     // Tên trường
        string  schoolCode;     // Mã trường
        bool    isValid;        // Còn hiệu lực không
        bool    exists;         // Đã từng tồn tại chưa
    }

    // ==========================================
    // STATE VARIABLES
    // ==========================================

    address public immutable superAdmin; // Cố định, không thể thay đổi

    // Địa chỉ ví trường => thông tin trường
    // giống hashmap từ key --> value
    mapping(address => School) private schools;

    // schoolCode => địa chỉ ví trường (tránh trùng mã)
    mapping(string => address) private schoolCodeToAddress;

    // certId => thông tin văn bằng
    mapping(string => Certificate) private certificates;

    uint256 public totalIssued;
    uint256 public totalSchools;

    // ==========================================
    // EVENTS
    // ==========================================

    event SchoolAuthorized(
        address indexed schoolAddress,
        string          schoolName,
        string          schoolCode,
        uint256         timestamp
    );

    event SchoolSuspended(
        address indexed schoolAddress,
        string          schoolCode,
        uint256         timestamp
    );

    event SchoolReinstated(
        address indexed schoolAddress,
        string          schoolCode,
        uint256         timestamp
    );

    event CertificateIssued(
        string  indexed certId,
        string          studentName,
        string          studentId,
        address indexed issuedBy,
        string          schoolCode,
        uint256         issueDate
    );

    event CertificateRevoked(
        string  indexed certId,
        address indexed revokedBy,
        string          schoolCode,
        uint256         revokedAt
    );

    // ==========================================
    // MODIFIERS
    // ==========================================

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Chi super admin moi co quyen!");
        _;
    }

    modifier onlyAuthorizedSchool() {
        require(schools[msg.sender].authorizedAt > 0, "Truong chua duoc dang ky!");
        require(schools[msg.sender].isAuthorized,     "Truong dang bi khoa!");
        _;
    }

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    constructor() {
        superAdmin = msg.sender;
    }

    // ==========================================
    // SUPER ADMIN: QUẢN LÝ TRƯỜNG
    // ==========================================

    function authorizeSchool(
        address       _schoolAddress,
        string memory _schoolName,
        string memory _schoolCode
    ) external onlySuperAdmin {
        require(_schoolAddress != address(0),               "Dia chi vi khong hop le!");
        require(_schoolAddress != superAdmin,               "Super admin khong the la truong!");
        require(bytes(_schoolName).length > 0,              "Ten truong khong duoc trong!");
        require(bytes(_schoolCode).length > 0,              "Ma truong khong duoc trong!");
        require(schools[_schoolAddress].authorizedAt == 0,  "Dia chi vi nay da duoc dang ky!");
        require(
            schoolCodeToAddress[_schoolCode] == address(0),
            "Ma truong nay da ton tai!"
        );

        schools[_schoolAddress] = School({
            schoolName:   _schoolName,
            schoolCode:   _schoolCode,
            isAuthorized: true,
            authorizedAt: block.timestamp,
            totalIssued:  0
        });

        schoolCodeToAddress[_schoolCode] = _schoolAddress;
        totalSchools++;

        emit SchoolAuthorized(_schoolAddress, _schoolName, _schoolCode, block.timestamp);
    }

    function suspendSchool(address _schoolAddress) external onlySuperAdmin {
        require(schools[_schoolAddress].authorizedAt > 0,  "Truong khong ton tai!");
        require(schools[_schoolAddress].isAuthorized,      "Truong da bi khoa roi!");

        schools[_schoolAddress].isAuthorized = false;

        emit SchoolSuspended(
            _schoolAddress,
            schools[_schoolAddress].schoolCode,
            block.timestamp
        );
    }

    function reinstateSchool(address _schoolAddress) external onlySuperAdmin {
        require(schools[_schoolAddress].authorizedAt > 0,   "Truong khong ton tai!");
        require(!schools[_schoolAddress].isAuthorized,      "Truong dang hoat dong binh thuong!");

        schools[_schoolAddress].isAuthorized = true;

        emit SchoolReinstated(
            _schoolAddress,
            schools[_schoolAddress].schoolCode,
            block.timestamp
        );
    }

    // ==========================================
    // SCHOOL: CẤP VĂN BẰNG
    // ==========================================

    function issueCertificateBatch(
        string[] memory _certIds,
        string[] memory _studentNames,
        string[] memory _studentIds,
        string[] memory _degreeTypes,
        string[] memory _majors,
        string[] memory _ipfsHashes
    ) public onlyAuthorizedSchool {

        // Kiểm tra tất cả mảng phải cùng độ dài
        uint256 count = _certIds.length;
        require(count > 0, "Danh sach khong duoc rong!");
        require(count <= 50, "Toi da 50 bang moi lan cap!"); // Tránh out of gas
        require(_studentNames.length == count, "Du lieu khong khop!");
        require(_studentIds.length   == count, "Du lieu khong khop!");
        require(_degreeTypes.length  == count, "Du lieu khong khop!");
        require(_majors.length       == count, "Du lieu khong khop!");
        require(_ipfsHashes.length   == count, "Du lieu khong khop!");

        School storage school = schools[msg.sender];

        for (uint256 i = 0; i < count; i++) {

            // Validate từng phần tử
            require(bytes(_certIds[i]).length > 0,      "Ma van bang khong duoc trong!");
            require(bytes(_studentNames[i]).length > 0, "Ten sinh vien khong duoc trong!");
            require(bytes(_studentIds[i]).length > 0,   "Ma sinh vien khong duoc trong!");
            require(bytes(_ipfsHashes[i]).length > 0,   "IPFS hash khong duoc trong!");
            require(!certificates[_certIds[i]].exists,  "Ma van bang da ton tai!");

            certificates[_certIds[i]] = Certificate({
                certId:      _certIds[i],
                studentName: _studentNames[i],
                studentId:   _studentIds[i],
                degreeType:  _degreeTypes[i],
                major:       _majors[i],
                ipfsHash:    _ipfsHashes[i],
                issueDate:   block.timestamp,
                issuedBy:    msg.sender,
                schoolName:  school.schoolName,
                schoolCode:  school.schoolCode,
                isValid:     true,
                exists:      true
            });

            school.totalIssued++;
            totalIssued++;

            emit CertificateIssued(
                _certIds[i],
                _studentNames[i],
                _studentIds[i],
                msg.sender,
                school.schoolCode,
                block.timestamp
            );
        }
    }

    // ==========================================
    // SCHOOL: THU HỒI VĂN BẰNG
    // ==========================================

    function revokeCertificate(string memory _certId) external onlyAuthorizedSchool {
        require(certificates[_certId].exists,  "Khong tim thay van bang!");
        require(certificates[_certId].isValid, "Van bang da bi thu hoi roi!");
        require(
            certificates[_certId].issuedBy == msg.sender,
            "Chi truong cap bang moi duoc thu hoi!"
        );

        certificates[_certId].isValid = false;

        emit CertificateRevoked(
            _certId,
            msg.sender,
            schools[msg.sender].schoolCode,
            block.timestamp
        );
    }

    // ==========================================
    // PUBLIC: XÁC THỰC VĂN BẰNG
    // ==========================================

    function verifyCertificate(string memory _certId)
        external
        view
        returns (
            bool    found,
            bool    isValid,
            string  memory certId,
            string  memory studentName,
            string  memory studentId,
            string  memory degreeType,
            string  memory major,
            string  memory ipfsHash,
            uint256 issueDate,
            address issuedBy,
            string  memory schoolName,
            string  memory schoolCode
        )
    {
        if (!certificates[_certId].exists) {
            return (false, false, "", "", "", "", "", "", 0, address(0), "", "");
        }

        Certificate memory cert = certificates[_certId];
        return (
            true,
            cert.isValid,
            cert.certId,
            cert.studentName,
            cert.studentId,
            cert.degreeType,
            cert.major,
            cert.ipfsHash,
            cert.issueDate,
            cert.issuedBy,
            cert.schoolName,
            cert.schoolCode
        );
    }

    // ==========================================
    // GETTERS
    // ==========================================

    function getSchoolByAddress(address _schoolAddress)
        external
        view
        returns (
            string  memory schoolName,
            string  memory schoolCode,
            bool    isAuthorized,
            bool    exists,
            uint256 authorizedAt,
            uint256 schoolTotalIssued
        )
    {
        School memory s = schools[_schoolAddress];
        return (
            s.schoolName,
            s.schoolCode,
            s.isAuthorized,
            s.authorizedAt > 0,   // exists = đã từng được đăng ký
            s.authorizedAt,
            s.totalIssued
        );
    }

    function getSchoolAddressByCode(string memory _schoolCode)
        external
        view
        returns (address)
    {
        return schoolCodeToAddress[_schoolCode];
    }

    function isSchoolAuthorized(address _schoolAddress)
        external
        view
        returns (bool)
    {
        return schools[_schoolAddress].authorizedAt > 0
            && schools[_schoolAddress].isAuthorized;
    }

    function getSystemStats()
        external
        view
        returns (uint256 systemTotalIssued, uint256 systemTotalSchools)
    {
        return (totalIssued, totalSchools);
    }
}