// Login - Wallet Login

import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { contractAddress, contractAbi } from "./constants";
import { formatEther, parseEther } from "viem";

function BasicDappIntegration() {
  const { data: contractName } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getContractName",
  });
  const { data: ownerName } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getOwnerName",
  });
  const { data: contractBalance, isPending: isContractBalanceLoading } =
    useReadContract({
      abi: contractAbi,
      address: contractAddress,
      functionName: "getContractBalance",
    });

  const { writeContract, isPending: isUpdatingContractName } =
    useWriteContract();
  const {
    data: hash,
    writeContract: payContract,
    isPending: isPayingContract,
  } = useWriteContract();

  const { isLoading: isTxConfirming } = useWaitForTransactionReceipt({
    confirmations: 2,
    hash,
  });

  const {
    data: withdrawHash,
    writeContract: withdraw,
    isPending: isWithdrawing,
  } = useWriteContract();

  const { isLoading: isWithdrawTxConfirming } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash: withdrawHash,
  });

  return (
    <div className="p-10">
      <w3m-button />

      <p>Contract Name: {contractName}</p>
      <p>Contract Owner: {ownerName}</p>
      <p>
        Contract Balance:{" "}
        {isContractBalanceLoading ? (
          "balance loading..."
        ) : (
          <>
            <span className="font-bold">
              {formatEther(contractBalance.toString())} ETH
            </span>
          </>
        )}
      </p>
      <button
        onClick={() => {
          writeContract({
            abi: contractAbi,
            address: contractAddress,
            functionName: "setOwnerName",
            args: ["Maaz Mehboob"],
          });
        }}
      >
        {isUpdatingContractName ? "loading..." : "Update Contract Name"}
      </button>

      <div></div>
      <br />
      <br />

      <button
        onClick={() => {
          payContract({
            abi: contractAbi,
            address: contractAddress,
            functionName: "payContract",
            value: parseEther("0.1"),
          });
        }}
      >
        {isPayingContract || isTxConfirming
          ? "loading..."
          : "Pay 1 ether to Contract"}
      </button>

      <br />
      <br />
      <br />

      <button
        onClick={() => {
          withdraw({
            abi: contractAbi,
            address: contractAddress,
            functionName: "withdraw",
          });
        }}
      >
        {isWithdrawing || isWithdrawTxConfirming
          ? "loading..."
          : `WithDraw ${formatEther(contractBalance.toString())} ETH`}
      </button>
    </div>
  );
}

export default BasicDappIntegration;
