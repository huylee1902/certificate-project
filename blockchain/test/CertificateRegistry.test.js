// test/CertificateRegistry.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
    let registry;
    let superAdmin, schoolWallet, otherWallet, publicWallet;

    // Deploy fresh contract trước mỗi test
    beforeEach(async function () {
        [superAdmin, schoolWallet, otherWallet, publicWallet] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("CertificateRegistry");
        registry = await Factory.deploy();
    });

    // ==========================================
    // SUPER ADMIN
    // ==========================================

    describe("authorizeSchool", function () {

        it("SuperAdmin cấp phép trường thành công", async function () {
            await registry.authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST");

            const school = await registry.getSchoolByAddress(schoolWallet.address);
            expect(school.schoolName).to.equal("Bach Khoa");
            expect(school.schoolCode).to.equal("HUST");
            expect(school.isAuthorized).to.equal(true);
            expect(school.exists).to.equal(true);
            expect(await registry.totalSchools()).to.equal(1);
        });

        it("Không phải superAdmin thì revert", async function () {
            await expect(
                registry.connect(otherWallet)
                    .authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST")
            ).to.be.revertedWith("Chi super admin moi co quyen!");
        });

        it("Không cho đăng ký trùng địa chỉ ví", async function () {
            await registry.authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST");

            await expect(
                registry.authorizeSchool(schoolWallet.address, "Bach Khoa 2", "HUST2")
            ).to.be.revertedWith("Dia chi vi nay da duoc dang ky!");
        });

        it("Không cho đăng ký trùng mã trường", async function () {
            await registry.authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST");

            await expect(
                registry.authorizeSchool(otherWallet.address, "Truong Khac", "HUST")
            ).to.be.revertedWith("Ma truong nay da ton tai!");
        });

        it("Không cho superAdmin tự đăng ký làm trường", async function () {
            await expect(
                registry.authorizeSchool(superAdmin.address, "Bach Khoa", "HUST")
            ).to.be.revertedWith("Super admin khong the la truong!");
        });

    });

    describe("suspendSchool / reinstateSchool", function () {

        beforeEach(async function () {
            await registry.authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST");
        });

        it("Khóa trường thành công", async function () {
            await registry.suspendSchool(schoolWallet.address);

            const school = await registry.getSchoolByAddress(schoolWallet.address);
            expect(school.isAuthorized).to.equal(false);
        });

        it("Trường bị khóa không cấp được bằng", async function () {
            await registry.suspendSchool(schoolWallet.address);

            await expect(
                registry.connect(schoolWallet)
                    .issueCertificate("CERT-001", "SV A", "SV001", "Gioi", "CNTT", "QmHash")
            ).to.be.revertedWith("Truong dang bi khoa!");
        });

        it("Mở khóa trường thành công", async function () {
            await registry.suspendSchool(schoolWallet.address);
            await registry.reinstateSchool(schoolWallet.address);

            const school = await registry.getSchoolByAddress(schoolWallet.address);
            expect(school.isAuthorized).to.equal(true);
        });

        it("Khóa trường đã bị khóa thì revert", async function () {
            await registry.suspendSchool(schoolWallet.address);

            await expect(
                registry.suspendSchool(schoolWallet.address)
            ).to.be.revertedWith("Truong da bi khoa roi!");
        });

    });

    // ==========================================
    // CẤP VĂN BẰNG
    // ==========================================

    describe("issueCertificate", function () {

        beforeEach(async function () {
            await registry.authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST");
        });

        it("Cấp bằng thành công", async function () {
            await registry.connect(schoolWallet)
                .issueCertificate("CERT-001", "Nguyen Van A", "SV001", "Gioi", "CNTT", "QmHash");

            const result = await registry.verifyCertificate("CERT-001");
            expect(result.found).to.equal(true);
            expect(result.isValid).to.equal(true);
            expect(result.studentName).to.equal("Nguyen Van A");
            expect(result.schoolCode).to.equal("HUST");
            expect(await registry.totalIssued()).to.equal(1);
        });

        it("Không cho cấp bằng trùng certId", async function () {
            await registry.connect(schoolWallet)
                .issueCertificate("CERT-001", "Nguyen Van A", "SV001", "Gioi", "CNTT", "QmHash");

            await expect(
                registry.connect(schoolWallet)
                    .issueCertificate("CERT-001", "Tran Van B", "SV002", "Kha", "KTPM", "QmHash2")
            ).to.be.revertedWith("Ma van bang da ton tai!");
        });

        it("Ví không phải trường thì revert", async function () {
            await expect(
                registry.connect(publicWallet)
                    .issueCertificate("CERT-001", "Nguyen Van A", "SV001", "Gioi", "CNTT", "QmHash")
            ).to.be.revertedWith("Truong chua duoc dang ky!");
        });

    });

    // ==========================================
    // THU HỒI VĂN BẰNG
    // ==========================================

    describe("revokeCertificate", function () {

        beforeEach(async function () {
            await registry.authorizeSchool(schoolWallet.address, "Bach Khoa", "HUST");
            await registry.connect(schoolWallet)
                .issueCertificate("CERT-001", "Nguyen Van A", "SV001", "Gioi", "CNTT", "QmHash");
        });

        it("Thu hồi bằng thành công", async function () {
            await registry.connect(schoolWallet).revokeCertificate("CERT-001");

            const result = await registry.verifyCertificate("CERT-001");
            expect(result.found).to.equal(true);   // vẫn tồn tại trên chain
            expect(result.isValid).to.equal(false); // nhưng không còn hiệu lực
        });

        it("Trường khác không thu hồi được bằng của trường này", async function () {
            await registry.authorizeSchool(otherWallet.address, "Truong Khac", "NEU");

            await expect(
                registry.connect(otherWallet).revokeCertificate("CERT-001")
            ).to.be.revertedWith("Chi truong cap bang moi duoc thu hoi!");
        });

        it("Không thu hồi bằng đã bị thu hồi", async function () {
            await registry.connect(schoolWallet).revokeCertificate("CERT-001");

            await expect(
                registry.connect(schoolWallet).revokeCertificate("CERT-001")
            ).to.be.revertedWith("Van bang da bi thu hoi roi!");
        });

    });

    // ==========================================
    // XÁC THỰC VĂN BẰNG
    // ==========================================

    describe("verifyCertificate", function () {

        it("Trả về found=false nếu certId không tồn tại", async function () {
            const result = await registry.verifyCertificate("CERT-KHONG-TON-TAI");
            expect(result.found).to.equal(false);
            expect(result.isValid).to.equal(false);
        });

    });

});