const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploy bằng tài khoản:", deployer.address);

    // Dòng này → Hardhat lấy bytecode từ artifacts/ ra
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");

    // Dòng này → gửi bytecode lên blockchain, nhận về địa chỉ contract
    const contract = await CertificateRegistry.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("=======================================");
    console.log("Contract deployed tại:", address);
    console.log("=======================================");
    console.log("Copy vào application.properties:");
    console.log(`blockchain.contract.address=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });