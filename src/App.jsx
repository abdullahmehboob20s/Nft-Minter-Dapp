// NFT Contract
// NFT Minter Dapp - 0.5 fees
// File Upload -> mint -> mint

import axios from "axios";
import { useState } from "react";
import { nftContractABI, nftContractAddress, pinataToken } from "./constants";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

// IMAGE STORAGE
// Pinata

// FLOW
// upload image
// upload on ipfs through api -> CID
// make opensea metadata with image CID then upload .json file to IPFS
// then take .json CID and send it as uri in contract

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const { data: nfts, isPending: isNftsLoading } = useReadContract({
    address: nftContractAddress,
    abi: nftContractABI,
    functionName: "getUserTokenURIs",
    args: [address],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        form,
        {
          headers: {
            Authorization: `Bearer ${pinataToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageHash = res.data.IpfsHash;
      console.log("image hash = ", imageHash);

      const body = {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: `${Math.floor(Math.random() * 1000)}.json` },
        pinataContent: {
          description: "My Dumb NFT",
          external_url: "",
          imageUrl: `ipfs://${imageHash}`,
          image: `ipfs://${imageHash}`,
          name: "Dave Starbelly",
          attributes: [],
        },
      };

      const jsonRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        body,
        {
          headers: {
            Authorization: `Bearer ${pinataToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      await writeContractAsync({
        address: nftContractAddress,
        abi: nftContractABI,
        functionName: "safeMint",
        args: [address, `ipfs://${jsonRes.data.IpfsHash}`],
      });

      console.log("Nft Created = ", jsonRes);
    } catch (error) {
      console.log("pinata error = ", error);
    }

    setLoading(false);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="p-14">
      {loading ? (
        "uploading to ipfs..."
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileUpload} />
          <button type="Submit">Submit</button>
        </form>
      )}

      <br />
      <br />
      <br />
      {isNftsLoading ? (
        <p>nfts loading...</p>
      ) : (
        nfts.map((item, i) => (
          <a key={i} href="#" className="block text-blue-500">
            {item}
          </a>
        ))
      )}
    </div>
  );
}

export default App;
