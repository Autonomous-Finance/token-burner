local bint = require('.bint')(256)
local json = require('json')

BurnedBalances = BurnedBalances or {}
TotalBurnedBalancesPerToken = TotalBurnedBalancesPerToken or {}
BurnHistory = BurnHistory or {}        
LPBurnHistory = LPBurnHistory or {}     
KnownLPTokens = KnownLPTokens or {}    

OPERATOR = OPERATOR or ao.env.Process.Tags.Operator

local function isLPToken(tokenProcessID)
    if KnownLPTokens[tokenProcessID] then
        return true, KnownLPTokens[tokenProcessID]
    end

    local infoResponse = ao.send({
        Target = tokenProcessID,
        Tags = {
            Action = 'Info',
        },
    }).receive()
    if infoResponse and infoResponse.Tags then
        if infoResponse.Tags['TokenA'] and infoResponse.Tags['TokenB'] then
            return true, infoResponse.Tags
        end
    end
    return false, nil
end

Handlers.add("burnTokens",
    Handlers.utils.hasMatchingTag("Action", "Credit-Notice"),
    function(msg)
        local tokenProcessID = msg.From
        local sender = msg.Tags.Sender
        local quantity = msg.Tags.Quantity

        ao.send({
            Target = tokenProcessID,
            Tags = {
                Action = 'Transfer',
                Recipient = '0000000000000000000000000000000000000000000',
                Quantity = quantity,
            },
        })

        BurnedBalances[sender] = BurnedBalances[sender] or {}
        local currentBalance = BurnedBalances[sender][tokenProcessID] or '0'
        local newBalance = tostring(bint(currentBalance) + bint(quantity))
        BurnedBalances[sender][tokenProcessID] = newBalance

        TotalBurnedBalancesPerToken[tokenProcessID] = TotalBurnedBalancesPerToken[tokenProcessID] or '0'
        local totalBurned = TotalBurnedBalancesPerToken[tokenProcessID]
        TotalBurnedBalancesPerToken[tokenProcessID] = tostring(bint(totalBurned) + bint(quantity))

        BurnHistory[tokenProcessID] = BurnHistory[tokenProcessID] or {}
        table.insert(BurnHistory[tokenProcessID], {
            amount = quantity,
            user = sender,
        })

        local isLP, lpInfo = isLPToken(tokenProcessID)
        if isLP then
            KnownLPTokens[tokenProcessID] = lpInfo
            LPBurnHistory[tokenProcessID] = LPBurnHistory[tokenProcessID] or {}
            table.insert(LPBurnHistory[tokenProcessID], {
                amount = quantity,
                user = sender,
            })
        end

        ao.send({
            Target = sender,
            Tags = {
                Action = 'Burned',
                Token = tokenProcessID,
                Quantity = quantity,
            },
        })
    end
)

Handlers.add("getBurnedBalance",
    Handlers.utils.hasMatchingTag("Action", "Burned-Balance"),
    function(msg)
        local tokenProcessID = msg.Tags.Token
        local recipient = msg.Tags.Recipient or msg.From

        local balance = '0'
        if BurnedBalances[recipient] and BurnedBalances[recipient][tokenProcessID] then
            balance = BurnedBalances[recipient][tokenProcessID]
        end

        ao.send({
            Target = msg.From,
            Tags = {
                Action = 'Burned-Balance-Response',
                Token = tokenProcessID,
                Recipient = recipient,
                Quantity = balance,
            },
        })
    end
)

Handlers.add("getBurns",
    Handlers.utils.hasMatchingTag("Action", "Get-Burns"),
    function(msg)
        local tokenProcessID = msg.Tags.Token

        local burns = BurnHistory[tokenProcessID] or {}

        ao.send({
            Target = msg.From,
            Tags = {
                Action = 'Get-Burns-Response',
                Token = tokenProcessID,
            },
            Data = json.encode(burns),
        })
    end
)

Handlers.add("getLPBurnHistory",
    Handlers.utils.hasMatchingTag("Action", "Get-LP-Burn-History"),
    function(msg)
        local tokenProcessID = msg.Tags.Token

        local lpTokens = {}
        for lpTokenID, lpInfo in pairs(KnownLPTokens) do
            if lpInfo['TokenA'] == tokenProcessID or lpInfo['TokenB'] == tokenProcessID then
                table.insert(lpTokens, {
                    LpToken = lpTokenID,
                    BurnHistory = LPBurnHistory[lpTokenID] or {},
                    Details = lpInfo,
                })
            end
        end

        ao.send({
            Target = msg.From,
            Tags = {
                Action = 'Get-LP-Burn-History-Response',
                Token = tokenProcessID,
            },
            Data = json.encode(lpTokens),
        })
    end
)

Handlers.add("info",
    Handlers.utils.hasMatchingTag("Action", "Info"),
    function(msg)
        local totalBurns = 0
        local totalAmountBurned = bint(0)
        local perTokenStats = {}

        for tokenProcessID, totalBurned in pairs(TotalBurnedBalancesPerToken) do
            local burns = BurnHistory[tokenProcessID] or {}
            local numBurns = #burns
            totalBurns = totalBurns + numBurns
            totalAmountBurned = totalAmountBurned + bint(totalBurned)
            perTokenStats[tokenProcessID] = {
                totalBurned = totalBurned,
                numBurns = numBurns
            }
        end

        local info = {
            totalBurnEvents = totalBurns,
            totalAmountBurned = tostring(totalAmountBurned),
            perTokenStats = perTokenStats,
        }

        ao.send({
            Target = msg.From,
            Tags = {
                Action = 'Info-Response',
                Operator = OPERATOR
            },
            Data = json.encode(info),
        })
    end
)
